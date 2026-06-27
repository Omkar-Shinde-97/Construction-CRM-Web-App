import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'danger'
    | 'outline'
    | 'gradient';
  children: ReactNode;
}

export function Button({
  className,
  variant = 'primary',
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary/90 shadow-glow hover:shadow-elevated transition-all',
    secondary:
      'bg-secondary text-white hover:bg-secondary/90 shadow-glow hover:shadow-elevated transition-all',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100/50 dark:text-slate-200 dark:hover:bg-slate-800/50 transition-all',
    danger:
      'bg-app-danger text-white hover:bg-app-danger/90 shadow-glow hover:shadow-elevated transition-all',
    outline:
      'border-2 border-primary bg-white/50 text-primary hover:bg-white/80 backdrop-blur-sm dark:border-primary/50 dark:bg-slate-900/50 dark:text-primary dark:hover:bg-slate-900/80 transition-all',
    gradient:
      'bg-gradient-primary text-white hover:shadow-elevated shadow-glow transition-all',
  };

  return (
    <button
      className={cn(
        'focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}>
      {children}
    </button>
  );
}
