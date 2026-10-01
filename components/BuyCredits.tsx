"use client";

import { useState } from "react";

export default function BuyCredits({ packageId, price, credits }: { packageId: string; price: number; credits: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pix, setPix] = useState<{ qrCode?: string | null; copyPaste?: string | null; packageName?: string; expiresAt?: string | null } | null>(null);

  async function buy() {
    setLoading(true); setError(""); setPix(null);
    try {
      const res = await fetch("/api/panterapay/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packageId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível criar o PIX.");
      setPix(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar o PIX.");
    } finally { setLoading(false); }
  }

  async function copy() {
    if (pix?.copyPaste) await navigator.clipboard.writeText(pix.copyPaste);
  }

  return (
    <div>
      <button className="btn primary" onClick={buy} disabled={loading}>
        {loading ? "Gerando PIX..." : `Comprar por R$ ${price.toFixed(2).replace(".", ",")}`}
      </button>
      {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}
      {pix && (
        <div className="pix-box">
          <strong>PIX gerado</strong>
          <p className="muted">{credits.toLocaleString("pt-BR")} créditos serão adicionados após a confirmação do pagamento.</p>
          {pix.qrCode && pix.qrCode.startsWith("data:image") && <img src={pix.qrCode} alt="QR Code PIX" className="pix-qr" />}
          {pix.copyPaste && (
            <>
              <textarea className="textarea pix-code" readOnly value={pix.copyPaste} />
              <button className="btn" onClick={copy}>Copiar código PIX</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
