type LogoProps = {
  className?: string;
  size?: number;
};

export function Logo({ className = '', size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`select-none ${className}`}
    >
      {/* Back paper shadow sheet representing workspaces / paste stacks */}
      <path d="M8 18h9a2 2 0 0 0 2-2V8" strokeDasharray="3 3" opacity={0.4} />

      {/* Main active sheet block */}
      <path d="M4 19V5a2 2 0 0 1 2-2h7l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />

      {/* Page Fold notch */}
      <path d="M13 3v4h4" />

      {/* Developer CLI command/code lines */}
      <path d="M7 10h4" opacity={0.8} />
      <path d="M7 14h6" opacity={0.8} />
    </svg>
  );
}
