"use client";

import { useMemo, useState } from "react";

type Package = {
  id: string;
  name: string;
  credits: number;
  price: number;
  description?: string | null;
  featured?: boolean | null;
};

type CartItem = Package & { quantity: number };

export default function CreditsShop({ packages }: { packages: Package[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pix, setPix] = useState<{ qrCode?: string | null; copyPaste?: string | null; packageName?: string; credits?: number; amount?: number; expiresAt?: string | null } | null>(null);

  function addToCart(pkg: Package) {
    setError("");
    setPix(null);
    setCart((current) => {
      const existing = current.find((item) => item.id === pkg.id);
      if (existing) return current.map((item) => item.id === pkg.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...pkg, quantity: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function changeQuantity(id: string, quantity: number) {
    if (quantity <= 0) return removeFromCart(id);
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity } : item));
  }

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const totalCredits = useMemo(() => cart.reduce((sum, item) => sum + item.credits * item.quantity, 0), [cart]);
  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  async function checkout() {
    if (!cart.length) return;
    setLoading(true);
    setError("");
    setPix(null);
    try {
      const res = await fetch("/api/panterapay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart.map((item) => ({ packageId: item.id, quantity: item.quantity })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.providerMessage || data.error || "Não foi possível criar o PIX.");
      setPix(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar o PIX.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (pix?.copyPaste) await navigator.clipboard.writeText(pix.copyPaste);
  }

  return (
    <>
      <div className="credit-shop-head">
        <div>
          <h2 className="shop-title">Escolha seus créditos</h2>
          <p className="muted">Adicione um ou mais pacotes ao carrinho e finalize tudo em um único PIX.</p>
        </div>
        <div className="cart-summary-pill">Carrinho · {itemCount} {itemCount === 1 ? "item" : "itens"}</div>
      </div>

      <div className="packages">
        {packages.map((pkg) => (
          <div className={"package " + (pkg.featured ? "featured" : "")} key={pkg.id}>
            {pkg.featured && <span className="package-badge">Mais escolhido</span>}
            <h3>{pkg.name}</h3>
            <div className="price">R$ {pkg.price.toFixed(2).replace(".", ",")}</div>
            <strong className="credit-amount">{pkg.credits.toLocaleString("pt-BR")} créditos</strong>
            <p>{pkg.description || "Créditos para suas campanhas."}</p>
            <button className="btn primary" onClick={() => addToCart(pkg)}>Adicionar ao carrinho</button>
          </div>
        ))}
      </div>

      <div className="cart-panel">
        <div className="panel-title">
          <h2>Seu carrinho</h2>
          <span>{itemCount} {itemCount === 1 ? "item" : "itens"}</span>
        </div>
        {!cart.length ? (
          <div className="cart-empty">Seu carrinho está vazio. Escolha um pacote acima para começar.</div>
        ) : (
          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-row" key={item.id}>
                <div className="grow">
                  <b>{item.name}</b>
                  <small>{item.credits.toLocaleString("pt-BR")} créditos · R$ {item.price.toFixed(2).replace(".", ",")}</small>
                </div>
                <div className="cart-controls">
                  <button className="qty-btn" onClick={() => changeQuantity(item.id, item.quantity - 1)} aria-label="Diminuir">−</button>
                  <span>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => changeQuantity(item.id, item.quantity + 1)} aria-label="Aumentar">+</button>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remover</button>
                </div>
                <strong>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</strong>
              </div>
            ))}
            <div className="cart-total">
              <div><small>Total de créditos</small><strong>{totalCredits.toLocaleString("pt-BR")}</strong></div>
              <div className="cart-price"><small>Total</small><strong>R$ {total.toFixed(2).replace(".", ",")}</strong></div>
              <button className="btn primary checkout-btn" onClick={checkout} disabled={loading}>
                {loading ? "Gerando PIX..." : "Finalizar compra"}
              </button>
            </div>
          </div>
        )}

        {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
        {pix && (
          <div className="pix-box">
            <strong>PIX gerado</strong>
            <p className="muted">{pix.credits?.toLocaleString("pt-BR")} créditos serão adicionados após a confirmação do pagamento.</p>
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
    </>
  );
}
