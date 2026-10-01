import { createClient } from "@/lib/supabase-server";
import BuyCredits from "@/components/BuyCredits";

export default async function Page() {
  const s = await createClient();
  const { data: p } = await s.from("credit_packages").select("*").eq("active", true).order("credits");
  const { data: c } = await s.from("credits").select("balance").maybeSingle();

  return (
    <section className="page">
      <div className="hero"><div><h1>Créditos</h1><p>Adicione saldo para usar nas suas campanhas.</p></div></div>
      <div className="balance">
        <div><small>Saldo disponível</small><strong>{c?.balance ?? 0} créditos</strong></div>
        <span className="muted">Pagamento via PIX</span>
      </div>
      <div className="packages">
        {p?.map((x: any) => (
          <div className={"package " + (x.featured ? "featured" : "")} key={x.id}>
            <h3>{x.name}</h3>
            <div className="price">{Number(x.credits).toLocaleString("pt-BR")}</div>
            <p>{x.description}</p>
            <BuyCredits packageId={x.id} price={Number(x.price)} credits={Number(x.credits)} />
          </div>
        ))}
      </div>
    </section>
  );
}
