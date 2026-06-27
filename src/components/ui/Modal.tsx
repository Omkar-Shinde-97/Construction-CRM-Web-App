import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export function Modal({
  open,
  title,
  children,
  onClose,
  size = 'md',
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 transition-all',
        open
          ? 'opacity-100 visible'
          : 'pointer-events-none invisible opacity-0',
      )}>
      <div
        className={cn(
          'w-full overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl shadow-elevated border border-white/20 dark:bg-slate-900/90 dark:border-slate-700/50 transition-all',
          size === 'sm'
            ? 'max-w-xl'
            : size === 'lg'
              ? 'max-w-5xl'
              : 'max-w-3xl',
        )}>
        <div className='flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50'>
          <h2 className='text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent'>
            {title}
          </h2>
          <Button
            variant='ghost'
            className='h-10 w-10 p-0'
            onClick={onClose}
            aria-label='Close modal'>
            <X size={18} />
          </Button>
        </div>
        <div className='p-6'>{children}</div>
      </div>
    </div>
  );
}
