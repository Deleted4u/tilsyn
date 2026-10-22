// Indstillingsikon: to skydere med runde knapper. Arver farve og størrelse fra teksten omkring.
export default function SettingsIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="7" cy="8" r="2.8" />
      <path d="M10 8h10" />
      <path d="M4 16h10" />
      <circle cx="17" cy="16" r="2.8" />
    </svg>
  );
}
