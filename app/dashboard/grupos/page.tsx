"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function Page() {
  const [groups, setGroups] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const db = createClient();

  async function load() {
    const { data } = await db.from("contact_groups").select("*").order("created_at", { ascending: false });
    setGroups(data || []);
  }

  useEffect(() => { load(); }, []);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    const { error } = await db.from("contact_groups").insert({
      user_id: user.id,
      name,
      description: description || null,
    });

    if (error) setMessage(error.message);
    else {
      setName("");
      setDescription("");
      setMessage("Grupo criado.");
      load();
    }
  }

  return (
    <section className="page">
      <div className="hero">
        <div><h1>Grupos</h1><p>Organize seus contatos por segmentos.</p></div>
        <button className="btn primary" onClick={() => document.getElementById("novo-grupo")?.scrollIntoView({ behavior: "smooth" })}>+ Novo grupo</button>
      </div>

      <div className="cols">
        <div className="panel" id="novo-grupo">
          <div className="panel-title"><h2>Novo grupo</h2></div>
          <form className="form" onSubmit={createGroup}>
            <div className="field"><label>Nome do grupo</label><input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Clientes" /></div>
            <div className="field"><label>Descrição</label><input className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição opcional" /></div>
            <button className="btn primary">Criar grupo</button>
            {message && <span className="muted">{message}</span>}
          </form>
        </div>

        <div className="panel">
          <div className="panel-title"><h2>Seus grupos</h2><span>{groups.length}</span></div>
          {groups.length ? groups.map((x: any) => (
            <div className="activity-row" key={x.id}>
              <div className="mini">◎</div>
              <div className="grow"><b>{x.name}</b><small>{x.description || "Sem descrição"}</small></div>
            </div>
          )) : <p className="muted">Nenhum grupo criado ainda.</p>}
        </div>
      </div>
    </section>
  );
}
