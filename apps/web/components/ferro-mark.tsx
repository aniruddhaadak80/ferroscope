export function FerroMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect x="0.5" y="0.5" width="31" height="31" stroke="currentColor" strokeOpacity="0.35" />
      <circle cx="16" cy="16" r="10.5" stroke="currentColor" strokeOpacity="0.22" />
      <circle cx="16" cy="16" r="6" stroke="var(--amber)" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="1.6" fill="var(--amber)" />
      <path d="M16 2.5V9" stroke="var(--amber)" strokeWidth="1.4" />
      <path d="M16 23V29.5" stroke="var(--amber)" strokeWidth="1.4" />
      <path d="M2.5 16H9" stroke="var(--amber)" strokeWidth="1.4" />
      <path d="M23 16H29.5" stroke="var(--amber)" strokeWidth="1.4" />
    </svg>
  );
}
