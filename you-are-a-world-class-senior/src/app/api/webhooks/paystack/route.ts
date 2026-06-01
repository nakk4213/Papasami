import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY ?? "").update(raw).digest("hex");
  if (hash !== signature) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const event = JSON.parse(raw);
  if (event.event === "charge.success") {
    const orderId = event.data.metadata?.orderId;
    if (orderId) {
      await prisma.payment.upsert({
        where: { reference: event.data.reference },
        update: { status: "SUCCEEDED" },
        create: {
          orderId,
          provider: "PAYSTACK",
          status: "SUCCEEDED",
          amount: Number(event.data.amount) / 100,
          currency: event.data.currency ?? "GHS",
          reference: event.data.reference,
          providerIntent: event.data.id?.toString()
        }
      });
      await prisma.order.update({ where: { id: orderId }, data: { status: "CONFIRMED", events: { create: { status: "CONFIRMED", note: "Paystack payment confirmed" } } } });
    }
  }
  return NextResponse.json({ received: true });
}
