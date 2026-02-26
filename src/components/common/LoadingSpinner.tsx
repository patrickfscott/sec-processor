export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return (
    <div
      className={`${sizeClass} border-2 border-terminal-border border-t-terminal-accent rounded-full animate-spin`}
    />
  );
}
