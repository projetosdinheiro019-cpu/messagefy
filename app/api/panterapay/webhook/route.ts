import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const PANERA_BASE = process.env.PANTERAPAY_API_URL || "https://panterapay-production.up.railway.app";

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function getTransactionId(payload: any) {
  return payload?.id || payload?.transactionId || payload?.transaction_id || payload?.data?.id || payload?.transaction?.id || null;
}

function getEvent(payload: any) {
  return payload?.event || payload?.type || payload?.status || payload?.data?.status || payload?.transaction?.status || null;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const event = String(getEvent(payload) || "").toLowerCase();
    const transactionId = getTransactionId(payload);

    if (!transactionId) return NextResponse.json({ received: true, ignored: true, reason: "missing_transaction_id" });

    // We don't trust the webhook body alone. The transaction is re-queried against
    // PanteraPay before any credits are released.
    const providerResponse = await fetch(`${PANERA_BASE}/transactions/${encodeURIComponent(transactionId)}`, {
      headers: { Authorization: process.env.PANTERAPAY_API_KEY!, "Content-Type": "application/json" },
      cache: "no-store",
    });
    const provider = await providerResponse.json().catch(() => null);
    if (!providerResponse.ok || !provider) return NextResponse.json({ received: true, verified: false }, { status: 202 });

    const providerStatus = String(provider.status || provider.data?.status || event || "").toLowerCase();
    const approved = ["approved", "paid", "payment.approved", "completed", "success", "succeeded"].includes(providerStatus);
    const failed = ["failed", "payment.failed", "canceled", "cancelled", "expired"].includes(providerStatus);

    const db = admin();
    const { data: payment } = await db.from("panterapay_payments")
      .select("id,user_id,package_id,amount_cents,credits,status")
      .eq("provider_transaction_id", transactionId)
      .maybeSingle();

    if (!payment) return NextResponse.json({ received: true, verified: true, ignored: true, reason: "unknown_transaction" });
    if (payment.status === "paid") return NextResponse.json({ received: true, alreadyProcessed: true });

    if (failed) {
      await db.from("panterapay_payments").update({ status: "failed" }).eq("id", payment.id);
      return NextResponse.json({ received: true, status: "failed" });
    }

    if (!approved) return NextResponse.json({ received: true, status: providerStatus || "pending" });

    const amount = Number(provider.amount ?? provider.data?.amount ?? provider.transaction?.amount ?? NaN);
    if (Number.isFinite(amount) && Math.round(amount) !== payment.amount_cents) {
      return NextResponse.json({ received: true, verified: false, reason: "amount_mismatch" }, { status: 409 });
    }

    const { data: result, error } = await db.rpc("confirm_panterapay_payment", {
      p_payment_id: payment.id,
      p_provider_transaction_id: transactionId,
    });
    if (error) {
      console.error(error);
      return NextResponse.json({ received: true, verified: true, processed: false }, { status: 500 });
    }

    return NextResponse.json({ received: true, processed: true, result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ received: true, processed: false }, { status: 500 });
  }
}
