import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'card p-6 border border-white/20 dark:border-slate-700/30',
        className,
      )}
      {...props}>
      {children}
    </div>
  );
}
