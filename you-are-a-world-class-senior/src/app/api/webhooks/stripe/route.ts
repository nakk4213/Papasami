import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { stripeClient } from "@/lib/payments";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const stripe = stripeClient();
  const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await prisma.payment.upsert({
        where: { reference: session.id },
        update: { status: PaymentStatus.SUCCEEDED },
        create: {
          orderId,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.SUCCEEDED,
          amount: Number(session.amount_total ?? 0) / 100,
          currency: session.currency?.toUpperCase() ?? "USD",
          reference: session.id,
          providerIntent: session.payment_intent?.toString()
        }
      });
      await prisma.order.update({ where: { id: orderId }, data: { status: "CONFIRMED", events: { create: { status: "CONFIRMED", note: "Stripe payment confirmed" } } } });
    }
  }
  return NextResponse.json({ received: true });
}
