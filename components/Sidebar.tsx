"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Brand from "@/components/Brand";

const links = [
  ["/dashboard", "Visão geral", "grid"],
  ["/dashboard/campanhas", "Campanhas", "send"],
  ["/dashboard/contatos", "Contatos", "users"],
  ["/dashboard/grupos", "Grupos", "layers"],
  ["/dashboard/creditos", "Créditos", "wallet"],
  ["/dashboard/historico", "Histórico", "clock"],
  ["/dashboard/configuracoes", "Configurações", "settings"],
];

function Icon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "grid") return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>;
  if (name === "send") return <svg {...common}><path d="m21 3-7.5 18-3.4-7.1L3 10.5 21 3Z"/><path d="M10.1 13.9 16 8"/></svg>;
  if (name === "users") return <svg {...common}><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M17 11a3.5 3.5 0 1 0 0-7M21 20v-1.5a4 4 0 0 0-3-3.87"/></svg>;
  if (name === "layers") return <svg {...common}><path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z"/><path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5"/></svg>;
  if (name === "wallet") return <svg {...common}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5A2.5 2.5 0 0 1 5.5 6H20"/><path d="M17 13h4v4h-4a2 2 0 1 1 0-4Z"/></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></svg>;
  return <svg {...common}><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42"/><circle cx="12" cy="12" r="3.5"/></svg>;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><Brand /></div>
      <div className="nav-label">Workspace</div>
      <nav className="nav">
        {links.map(([href, label, icon]) => (
          <Link key={href} href={href} className={pathname === href ? "active" : ""}>
            <span className="nav-icon"><Icon name={icon} /></span><span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="plan-dot" />
        <div className="account-copy"><strong>Workspace</strong><small>Conta Messagefy</small></div>
        <button aria-label="Sair" className="logout-btn" onClick={async () => { await createClient().auth.signOut(); router.push("/login"); }}>⎋</button>
      </div>
    </aside>
  );
}
