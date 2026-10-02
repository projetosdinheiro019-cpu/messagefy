import Link from "next/link";

export default function Brand({ href = "/dashboard", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className={`brand-lockup ${compact ? "brand-compact" : ""}`} aria-label="Messagefy">
      <span className="brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 42 42" fill="none">
          <path d="M8 10.5C8 8.57 9.57 7 11.5 7h19C32.43 7 34 8.57 34 10.5v14c0 1.93-1.57 3.5-3.5 3.5H19l-7.2 6.1c-.75.64-1.9.1-1.8-.88l.45-5.22A3.5 3.5 0 0 1 8 24.5v-14Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
          <path d="M14 15h14M14 20h9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M28.8 7.6 35 13.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity=".55"/>
        </svg>
      </span>
      {!compact && <span className="brand-wordmark"><strong>Messagefy</strong><small>COMMUNICATION PLATFORM</small></span>}
    </Link>
  );
}
