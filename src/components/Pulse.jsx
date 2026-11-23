// The ECG "pulse line" used as the brand mark and on the login screen.
export function PulseMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0f8b8d" />
      <path d="M3 17h7l3-8 5 15 3-7h8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PulseLine({ className = "" }) {
  return (
    <svg className={`pulse-line ${className}`} viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true">
      <path
        className="pulse-path"
        d="M0 70 H150 L175 70 L195 20 L225 105 L250 45 L268 70 H380 L400 70 L420 30 L445 95 L465 70 H600"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
