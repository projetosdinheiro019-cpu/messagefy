"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function SignupForm() {
  const [n, setN] = useState("");
  const [e, setE] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function go(x: React.FormEvent) {
    x.preventDefault();
    setErr("");
    const { error } = await createClient().auth.signUp({
      email: e,
      password: p,
      options: { data: { full_name: n } },
    });
    if (error) setErr(error.message);
    else setDone(true);
  }

  if (done)
    return (
      <main className="auth">
        <section className="auth-card">
          <div className="logo"><div className="logo-mark">M</div><b>Messagefy</b></div>
          <h1 className="auth-title">Confirme seu e-mail</h1>
          <p className="auth-sub">Enviamos a confirmação para <b>{e}</b>.</p>
          <a className="btn primary" href="/login">Ir para login</a>
        </section>
      </main>
    );

  return (
    <main className="auth">
      <section className="auth-card">
        <div className="logo"><div className="logo-mark">M</div><b>Messagefy</b></div>
        <h1 className="auth-title">Crie sua conta</h1>
        <p className="auth-sub">Comece a organizar sua comunicação.</p>
        <form className="form" onSubmit={go}>
          {err && <div className="error">{err}</div>}
          <div className="field"><label>Nome</label><input className="input" required value={n} onChange={x => setN(x.target.value)} /></div>
          <div className="field"><label>E-mail</label><input className="input" type="email" required value={e} onChange={x => setE(x.target.value)} /></div>
          <div className="field"><label>Senha</label><input className="input" type="password" minLength={6} required value={p} onChange={x => setP(x.target.value)} /></div>
          <button className="btn primary">Criar conta</button>
        </form>
        <p className="muted" style={{ fontSize: 12 }}>Já possui conta? <a className="link" href="/login">Entrar</a></p>
      </section>
    </main>
  );
}
