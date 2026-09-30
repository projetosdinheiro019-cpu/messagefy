"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function Page() {
  const [groups, setGroups] = useState<any[]>([]);
  const [groupId, setGroupId] = useState("");
  const [n, setN] = useState("");
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const db = createClient();

  useEffect(() => {
    async function loadGroups() {
      const { data } = await db
        .from("contact_groups")
        .select("id,name,description")
        .order("created_at", { ascending: false });
      setGroups(data || []);
    }
    loadGroups();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    if (!groupId) {
      setStatus("Selecione um grupo de destino.");
      return;
    }

    let media_url = null;
    let media_type = null;

    if (file) {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const up = await db.storage.from("messagefy-media").upload(path, file);
      if (up.error) {
        setStatus(up.error.message);
        return;
      }
      media_url = path;
      media_type = file.type.split("/")[0];
    }

    const { error } = await db.from("campaigns").insert({
      user_id: user.id,
      name: n,
      message: msg,
      media_url,
      media_type,
      group_id: groupId,
      status: "draft",
    });

    setStatus(error ? error.message : "Campanha salva com sucesso.");
    if (!error) {
      setN("");
      setMsg("");
      setFile(null);
      setGroupId("");
    }
  }

  return (
    <section className="page">
      <div className="hero">
        <div>
          <h1>Nova campanha</h1>
          <p>Prepare texto e mídia para uma comunicação autorizada.</p>
        </div>
      </div>

      <div className="panel">
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="field">
              <label>Nome</label>
              <input
                className="input"
                required
                value={n}
                onChange={e => setN(e.target.value)}
                placeholder="Ex.: Novidades da semana"
              />
            </div>

            <div className="field">
              <label>Grupo de destino</label>
              <select
                className="select"
                required
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
              >
                <option value="">Selecione um grupo</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {groups.length === 0 && (
            <p className="muted">Crie um grupo em Grupos antes de criar uma campanha.</p>
          )}

          <div className="field">
            <label>Mensagem</label>
            <textarea
              className="textarea"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="Digite a mensagem..."
            />
          </div>

          <div className="field">
            <label>Mídia</label>
            <div className="drop">
              <input
                type="file"
                accept="image/*,video/*,audio/*,.pdf"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              {file && <b>{file.name}</b>}
              <small>Armazenamento privado do Messagefy.</small>
            </div>
          </div>

          <div className="actions">
            <button className="btn primary" disabled={!groups.length}>
              Salvar campanha
            </button>
          </div>

          {status && <p className="muted">{status}</p>}
        </form>
      </div>
    </section>
  );
}
