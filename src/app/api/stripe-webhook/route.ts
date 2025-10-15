import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/stack-server";
import type Stripe from "stripe";
import { db } from "@/database/db";
import { orders, orderItems, carts, cartItems } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  if (!sig || !webhookSecret) return NextResponse.json({ ok: true }, { status: 200 });

  const buf = await req.arrayBuffer();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return new NextResponse("Bad signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId as string | undefined;
      if (!userId) return NextResponse.json({ ok: true });

      const itemsMeta = session.metadata?.items ? JSON.parse(session.metadata.items) as { productId: number; quantity: number }[] : [];

      const subtotalCents = 0; // prices already charged via Stripe; we persist provided totals
      const totalAmount = (Number(session.amount_total || 0) / 100).toFixed(2);

      const inserted = await db.insert(orders).values({
        ownerId: userId,
        status: "paid",
        subtotalAmount: totalAmount,
        totalAmount: totalAmount,
        paymentStatus: "paid",
      }).returning();

      const createdOrder = inserted[0];

      for (const it of itemsMeta) {
        if (it.productId && it.quantity) {
          await db.insert(orderItems).values({ orderId: createdOrder.id, productId: it.productId, quantity: it.quantity });
        }
      }

      // Clear cart if exists
      const userCart = await db.select().from(carts).where(eq(carts.ownerId, userId)).limit(1);
      if (userCart.length) {
        await db.delete(cartItems).where(eq(cartItems.cartId, userCart[0].id));
      }
    }
  } catch (e) {
    console.error("Webhook handling error", e);
  }

  return NextResponse.json({ received: true });
}


