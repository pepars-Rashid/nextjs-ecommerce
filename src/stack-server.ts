import { StackServerApp } from "@stackframe/stack";
import Stripe from "stripe";

export const stackServerApp = new StackServerApp({
	projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
	publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
	secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
	tokenStore: "nextjs-cookie",
});

// Stripe server client (test mode via key prefix sk_test_)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);