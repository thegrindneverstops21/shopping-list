export default function SleepyListIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="70" y="8" width="40" height="18" rx="9" stroke="var(--color-primary)" strokeWidth="6" />
      <circle cx="90" cy="17" r="3" fill="var(--color-primary)" />
      <rect x="20" y="22" width="140" height="180" rx="16" stroke="var(--color-primary)" strokeWidth="6" />
      <rect x="38" y="42" width="104" height="140" rx="6" stroke="var(--color-primary)" strokeWidth="5" />
      <path d="M60 96 q10 10 20 0" stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round" />
      <path d="M100 96 q10 10 20 0" stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round" />
      <line x1="82" y1="120" x2="98" y2="120" stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="90" cy="168" r="4" fill="var(--color-primary)" />
      <text x="150" y="34" fontSize="28" fontWeight="bold" fill="var(--color-primary)">Z</text>
      <text x="170" y="60" fontSize="19" fontWeight="bold" fill="var(--color-primary)" opacity="0.65">Z</text>
    </svg>
  );
}