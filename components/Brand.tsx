import Link from "next/link";

export default function Brand({ href = "/dashboard", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className={`brand-lockup ${compact ? "brand-compact" : ""}`} aria-label="Messagefy">
      <span className="brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 44 44" fill="none">
          <defs>
            <linearGradient id="mf-logo" x1="7" y1="6" x2="37" y2="39" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5B5CF0"/>
              <stop offset="1" stopColor="#2F80ED"/>
            </linearGradient>
          </defs>
          <path d="M9 11.5A4.5 4.5 0 0 1 13.5 7h17A4.5 4.5 0 0 1 35 11.5v13A4.5 4.5 0 0 1 30.5 29H20l-7.8 6.4a1.1 1.1 0 0 1-1.8-.85L11 29.1a4.5 4.5 0 0 1-2-3.6v-14Z" fill="url(#mf-logo)"/>
          <path d="m15 16 5 5 5-5 4 4" stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="15" cy="16" r="1.4" fill="white"/>
          <circle cx="25" cy="16" r="1.4" fill="white"/>
        </svg>
      </span>
      {!compact && <span className="brand-wordmark"><strong>Messagefy</strong><small>MESSAGING WORKSPACE</small></span>}
    </Link>
  );
}
