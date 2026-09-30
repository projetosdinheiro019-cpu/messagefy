"use client";

import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNewCampaign = pathname === "/dashboard" || pathname === "/dashboard/campanhas";

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <div className="crumb">Messagefy / Painel</div>
          {showNewCampaign ? (
            <div className="top-actions">
              <Link className="btn primary" href="/dashboard/campanhas">
                + Nova campanha
              </Link>
            </div>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}
