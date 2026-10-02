"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";
export default function LoginForm(){
 const r=useRouter(); const[e,setE]=useState(""); const[p,setP]=useState(""); const[err,setErr]=useState(""); const[load,setLoad]=useState(false);
 async function go(x:React.FormEvent){x.preventDefault();setErr("");setLoad(true);const{error}=await createClient().auth.signInWithPassword({email:e,password:p});if(error){setErr(error.message);setLoad(false);return}r.push("/dashboard");r.refresh()}
 return <main className="auth"><div className="auth-orbit orbit-one"/><div className="auth-orbit orbit-two"/><section className="auth-card"><Brand href="/login"/><div className="eyebrow">ACESSO AO WORKSPACE</div><h1 className="auth-title">Bem-vindo de volta.</h1><p className="auth-sub">Acesse seu workspace e continue gerenciando suas comunicações.</p><form className="form" onSubmit={go}>{err&&<div className="error">{err}</div>}<div className="field"><label>E-mail</label><input className="input" type="email" required value={e} onChange={x=>setE(x.target.value)} placeholder="voce@empresa.com"/></div><div className="field"><div className="field-head"><label>Senha</label><span>Seguro e privado</span></div><input className="input" type="password" required value={p} onChange={x=>setP(x.target.value)} placeholder="••••••••"/></div><button className="btn primary auth-submit">{load?"Entrando...":"Entrar no workspace"}</button></form><p className="auth-foot">Ainda não tem conta? <a className="link" href="/cadastro">Criar uma conta</a></p></section></main>
}
