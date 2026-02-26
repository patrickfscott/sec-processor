interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-terminal-accent/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-terminal-accent hover:bg-terminal-accent/80 text-white',
    secondary: 'bg-terminal-surface hover:bg-terminal-highlight border border-terminal-border text-gray-200',
    ghost: 'hover:bg-terminal-highlight text-gray-400 hover:text-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
