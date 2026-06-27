import { X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import { cn } from '../../utils/cn';

const variantStyles: Record<string, string> = {
  success:
    'border border-emerald-200/50 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 text-emerald-900 backdrop-blur-sm dark:from-emerald-500/15 dark:to-teal-500/15 dark:border-emerald-400/30 dark:text-emerald-200 shadow-glow',
  error:
    'border border-red-200/50 bg-gradient-to-r from-red-50/80 to-rose-50/80 text-red-900 backdrop-blur-sm dark:from-red-500/15 dark:to-rose-500/15 dark:border-red-400/30 dark:text-red-200 shadow-glow',
  warning:
    'border border-amber-200/50 bg-gradient-to-r from-amber-50/80 to-orange-50/80 text-amber-900 backdrop-blur-sm dark:from-amber-500/15 dark:to-orange-500/15 dark:border-amber-400/30 dark:text-amber-200 shadow-glow',
  info: 'border border-blue-200/50 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 text-blue-900 backdrop-blur-sm dark:from-blue-500/15 dark:to-cyan-500/15 dark:border-blue-400/30 dark:text-blue-200 shadow-glow',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className='fixed right-4 top-4 z-50 flex w-[calc(100%-1rem)] max-w-xs flex-col gap-3 sm:w-auto'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'rounded-xl p-4 transition-all duration-300 animate-in slide-in-from-right',
            variantStyles[toast.variant],
          )}>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='font-bold text-sm'>{toast.title}</p>
              {toast.description && (
                <p className='mt-1 text-xs opacity-90'>{toast.description}</p>
              )}
            </div>
            <button
              className='text-opacity-50 hover:text-opacity-100 transition-all'
              onClick={() => removeToast(toast.id)}
              aria-label='Dismiss toast'>
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
