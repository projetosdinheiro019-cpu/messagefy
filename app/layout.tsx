import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messagefy — Messaging Workspace",
  description: "Workspace profissional para contatos, grupos e campanhas.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
