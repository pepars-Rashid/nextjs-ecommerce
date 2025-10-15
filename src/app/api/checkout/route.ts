import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stackServerApp } from "@/stack-server";
import { db } from "@/database/db";
import { carts, cartItems, products } from "@/database/schema";
import { and, eq } from "drizzle-orm";

type Body = {
  mode: "cart" | "single";
  productId?: number;
  quantity?: number;
  success_url?: string;
  cancel_url?: string;
};

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const mode = body.mode ?? "cart";

    const successUrl = body.success_url || `${req.nextUrl.origin}/orders/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = body.cancel_url || `${req.nextUrl.origin}/cart`;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    const metaItems: { productId: number; quantity: number }[] = [];

    if (mode === "single") {
      if (!body.productId || !body.quantity) {
        return NextResponse.json({ error: "Missing productId/quantity" }, { status: 400 });
      }
      const product = await db.query.products.findFirst({
        where: eq(products.id, body.productId),
        columns: { id: true, title: true, discountedPrice: true },
      });
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

      const unitAmount = Math.round(parseFloat(String(product.discountedPrice)) * 100);
      lineItems.push({
        quantity: body.quantity,
        price_data: {
          currency: "usd",
          product_data: { name: product.title },
          unit_amount: unitAmount,
        },
      });
      metaItems.push({ productId: product.id, quantity: body.quantity });
    } else {
      const userCart = await db.select().from(carts).where(eq(carts.ownerId, user.id)).limit(1);
      if (!userCart.length) return NextResponse.json({ error: "Cart empty" }, { status: 400 });

      const items = await db.query.cartItems.findMany({
        where: eq(cartItems.cartId, userCart[0].id),
        columns: { quantity: true },
        with: { product: { columns: { id: true, title: true, discountedPrice: true } } },
      });
      if (!items.length) return NextResponse.json({ error: "Cart empty" }, { status: 400 });

      for (const item of items) {
        const unitAmount = Math.round(parseFloat(String(item.product.discountedPrice)) * 100);
        lineItems.push({
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            product_data: { name: item.product.title },
            unit_amount: unitAmount,
          },
        });
        metaItems.push({ productId: item.product.id, quantity: item.quantity });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        checkoutMode: mode,
        items: JSON.stringify(metaItems),
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}


