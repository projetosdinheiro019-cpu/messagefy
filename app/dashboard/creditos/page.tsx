import { createClient } from "@/lib/supabase-server";
import CreditsShop from "@/components/CreditsShop";

export default async function Page() {
  const s = await createClient();
  const { data: p } = await s.from("credit_packages").select("id,name,credits,price,description,featured").eq("active", true).order("price");
  const { data: c } = await s.from("credits").select("balance").maybeSingle();

  return (
    <section className="page">
      <div className="hero"><div><h1>Créditos</h1><p>Compre saldo e use nos seus futuros disparos.</p></div></div>
      <div className="balance">
        <div><small>Saldo disponível</small><strong>{c?.balance ?? 0} créditos</strong></div>
        <span className="status-chip"><span /> PIX disponível</span>
      </div>
      <CreditsShop packages={(p || []) as any} />
    </section>
  );
}
