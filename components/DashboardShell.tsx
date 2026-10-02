"use client";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "@/components/Brand";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNewCampaign = pathname === "/dashboard" || pathname === "/dashboard/campanhas";
  const title = pathname === "/dashboard" ? "Visão geral" : pathname.split("/").pop()?.replace("configuracoes", "configurações") || "Painel";
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div className="mobile-brand"><Brand compact /></div>
          <div className="breadcrumb"><span>Messagefy</span><i>/</i><b>{title}</b></div>
          <div className="top-actions">
            <div className="status-chip"><span /> Sistema online</div>
            {showNewCampaign && <Link className="btn primary top-create" href="/dashboard/campanhas"><span>+</span> Nova campanha</Link>}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
