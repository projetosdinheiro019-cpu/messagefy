import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const PANERA_BASE = process.env.PANTERAPAY_API_URL || "https://panterapay-production.up.railway.app";

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const { packageId } = await req.json();
    if (!packageId) return NextResponse.json({ error: "Pacote inválido." }, { status: 400 });

    const { data: pkg, error: pkgError } = await supabase
      .from("credit_packages")
      .select("id,name,credits,price,active")
      .eq("id", packageId)
      .eq("active", true)
      .single();

    if (pkgError || !pkg) return NextResponse.json({ error: "Pacote não encontrado." }, { status: 404 });

    const amountCents = Math.round(Number(pkg.price) * 100);
    if (!Number.isFinite(amountCents) || amountCents < 50) {
      return NextResponse.json({ error: "Valor do pacote inválido." }, { status: 400 });
    }

    const webhookUrl = `${new URL(req.url).origin}/api/panterapay/webhook`;
    const response = await fetch(`${PANERA_BASE}/transactions`, {
      method: "POST",
      headers: {
        Authorization: process.env.PANTERAPAY_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amountCents, webhook: webhookUrl }),
      cache: "no-store",
    });

    const provider = await response.json().catch(() => null);
    if (!response.ok || !provider) {
      return NextResponse.json({ error: "A PanteraPay não criou a cobrança.", details: provider }, { status: 502 });
    }

    const providerId = provider.id;
    const qrCode = provider.qrCodeBase64 || provider.qrCode || provider.qr_code || null;
    const copyPaste = provider.copyPaste || provider.copy_paste || provider.pixCode || null;

    if (!providerId) return NextResponse.json({ error: "Resposta da PanteraPay sem ID da transação." }, { status: 502 });

    const db = admin();
    const { error: paymentError } = await db.from("panterapay_payments").insert({
      user_id: user.id,
      package_id: pkg.id,
      provider_transaction_id: providerId,
      amount_cents: amountCents,
      credits: Number(pkg.credits),
      status: "pending",
      qr_code: qrCode,
      copy_paste: copyPaste,
      expires_at: provider.expiresAt || provider.expires_at || null,
    });

    if (paymentError) {
      console.error(paymentError);
      return NextResponse.json({ error: "Cobrança criada, mas não foi possível registrar o pagamento no Messagefy." }, { status: 500 });
    }

    return NextResponse.json({
      paymentId: providerId,
      amount: Number(pkg.price),
      packageName: pkg.name,
      credits: Number(pkg.credits),
      qrCode,
      copyPaste,
      expiresAt: provider.expiresAt || provider.expires_at || null,
      status: provider.status || "pending",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno ao criar cobrança." }, { status: 500 });
  }
}
