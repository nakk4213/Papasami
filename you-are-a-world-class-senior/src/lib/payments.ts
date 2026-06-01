import "server-only";
import Stripe from "stripe";

export function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function createStripeCheckout(input: { amount: number; orderId: string; email: string; title: string }) {
  const stripe = stripeClient();
  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(input.amount * 100),
          product_data: { name: input.title }
        }
      }
    ],
    metadata: { orderId: input.orderId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client/orders?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=1`
  });
}

export async function initializePaystack(input: { amount: number; orderId: string; email: string }) {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error("Missing PAYSTACK_SECRET_KEY");
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amount * 100),
      metadata: { orderId: input.orderId },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client/payments`
    })
  });

  if (!response.ok) throw new Error("Unable to initialize Paystack payment");
  return response.json() as Promise<{ data: { authorization_url: string; reference: string } }>;
}
