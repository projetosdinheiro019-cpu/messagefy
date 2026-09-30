"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function Page() {
  const [s, setS] = useState<any[]>([]);
  const [n, setN] = useState("");
  const [p, setP] = useState("");
  const [m, setM] = useState("");
  const db = createClient();

  async function load() {
    const { data } = await db.from("contacts").select("*").order("created_at", { ascending: false });
    setS(data || []);
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setM("");
    const { data: { user } } = await db.auth.getUser();
    const { error } = await db.from("contacts").insert({
      user_id: user!.id,
      name: n,
      phone: p,
      opted_in: true,
    });
    if (error) setM(error.message);
    else {
      setN("");
      setP("");
      setM("Contato adicionado.");
      load();
    }
  }

  return (
    <section className="page">
      <div className="hero"><div><h1>Contatos</h1><p>Gerencie sua base de contatos autorizados.</p></div></div>
      <div className="cols">
        <div className="panel">
          <div className="panel-title"><h2>Novo contato</h2></div>
          <form className="form" onSubmit={add}>
            <div className="field"><label>Nome</label><input className="input" required value={n} onChange={e => setN(e.target.value)} /></div>
            <div className="field"><label>Telefone</label><input className="input" required value={p} onChange={e => setP(e.target.value)} placeholder="+55 11 99999-9999" /></div>
            <p className="muted" style={{ fontSize: 11 }}>Os contatos adicionados aqui são tratados como contatos autorizados.</p>
            <button className="btn primary">Adicionar</button>
            {m && <span className="muted">{m}</span>}
          </form>
        </div>
        <div className="panel">
          <div className="panel-title"><h2>Contatos</h2><span>{s.length}</span></div>
          <table className="table"><thead><tr><th>Nome</th><th>Telefone</th><th>Status</th></tr></thead><tbody>
            {s.map(x => <tr key={x.id}><td><div className="contact"><div className="avatar">{x.name.slice(0, 2).toUpperCase()}</div><b>{x.name}</b></div></td><td>{x.phone}</td><td><span className="tag">Autorizado</span></td></tr>)}
          </tbody></table>
        </div>
      </div>
    </section>
  );
}
