import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const PANTERA_BASE = process.env.PANTERAPAY_API_URL || "https://panterapay-production.up.railway.app";

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function providerErrorDetails(body: unknown) {
  if (!body || typeof body !== "object") return { message: String(body || "Resposta vazia da PanteraPay") };
  const value = body as Record<string, unknown>;
  return {
    message: value.message || value.error || value.detail || value.reason || "A PanteraPay recusou a cobrança.",
    code: value.code || value.statusCode || value.errorCode || undefined,
  };
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const body = await req.json();
    const rawItems = Array.isArray(body?.items) ? body.items : (body?.packageId ? [{ packageId: body.packageId, quantity: 1 }] : []);
    if (!rawItems.length) return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });

    const normalized = rawItems.map((item: any) => ({
      packageId: String(item?.packageId || ""),
      quantity: Math.max(1, Math.floor(Number(item?.quantity || 1))),
    })).filter((item: any) => item.packageId);
    if (!normalized.length) return NextResponse.json({ error: "Carrinho inválido." }, { status: 400 });

    const packageIds = [...new Set(normalized.map((item: any) => item.packageId))];
    const { data: packages, error: packagesError } = await supabase
      .from("credit_packages")
      .select("id,name,credits,price,active")
      .in("id", packageIds)
      .eq("active", true);

    if (packagesError || !packages || packages.length !== packageIds.length) {
      return NextResponse.json({ error: "Um ou mais pacotes não foram encontrados." }, { status: 404 });
    }

    const packageMap = new Map(packages.map((pkg: any) => [pkg.id, pkg]));
    const items = normalized.map((item: any) => {
      const pkg: any = packageMap.get(item.packageId);
      return { packageId: pkg.id, name: pkg.name, quantity: item.quantity, credits: Number(pkg.credits), price: Number(pkg.price) };
    });

    const amountCents = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100);
    const totalCredits = items.reduce((sum, item) => sum + item.credits * item.quantity, 0);
    if (!Number.isFinite(amountCents) || amountCents < 50 || !Number.isFinite(totalCredits) || totalCredits <= 0) {
      return NextResponse.json({ error: "Valor do carrinho inválido." }, { status: 400 });
    }

    const webhookUrl = `${new URL(req.url).origin}/api/panterapay/webhook`;
    const response = await fetch(`${PANTERA_BASE}/transactions`, {
      method: "POST",
      headers: {
        Authorization: process.env.PANTERAPAY_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amountCents, webhook: webhookUrl }),
      cache: "no-store",
    });

    const rawBody = await response.text();
    let provider: Record<string, unknown> | null = null;
    try {
      provider = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      provider = null;
    }

    if (!response.ok || !provider) {
      const details = providerErrorDetails(provider || rawBody);
      console.error("PanteraPay create failed", {
        status: response.status,
        statusText: response.statusText,
        details,
        amountCents,
      });

      return NextResponse.json(
        {
          error: "A PanteraPay não criou a cobrança.",
          providerStatus: response.status,
          providerMessage: details.message,
          providerCode: details.code || null,
        },
        { status: 502 }
      );
    }

    const providerId = provider.id;
    const qrCode = provider.qrCodeBase64 || provider.qrCode || provider.qr_code || null;
    const copyPaste = provider.copyPaste || provider.copy_paste || provider.pixCode || null;

    if (!providerId) {
      console.error("PanteraPay response without transaction id", { provider });
      return NextResponse.json(
        { error: "Resposta da PanteraPay sem ID da transação.", providerStatus: response.status },
        { status: 502 }
      );
    }

    const db = admin();
    const { error: paymentError } = await db.from("panterapay_payments").insert({
      user_id: user.id,
      package_id: items.length === 1 ? items[0].packageId : null,
      provider_transaction_id: providerId,
      amount_cents: amountCents,
      credits: totalCredits,
      items,
      status: "pending",
      qr_code: typeof qrCode === "string" ? qrCode : null,
      copy_paste: typeof copyPaste === "string" ? copyPaste : null,
      expires_at: provider.expiresAt || provider.expires_at || null,
    });

    if (paymentError) {
      console.error("Messagefy payment insert failed", paymentError);
      return NextResponse.json({ error: "Cobrança criada, mas não foi possível registrar o pagamento no Messagefy." }, { status: 500 });
    }

    return NextResponse.json({
      paymentId: providerId,
      amount: amountCents / 100,
      packageName: items.length === 1 ? items[0].name : "Carrinho",
      credits: totalCredits,
      items,
      qrCode,
      copyPaste,
      expiresAt: provider.expiresAt || provider.expires_at || null,
      status: provider.status || "pending",
    });
  } catch (error) {
    console.error("PanteraPay create internal error", error);
    return NextResponse.json({ error: "Erro interno ao criar cobrança." }, { status: 500 });
  }
}
