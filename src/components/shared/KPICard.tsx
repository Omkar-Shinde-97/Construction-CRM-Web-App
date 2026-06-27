import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

export function KPICard({
  title,
  value,
  change,
  icon: Icon,
  tone = 'blue',
}: {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  tone?: 'blue' | 'orange' | 'green' | 'red';
}) {
  const tones = {
    blue: 'bg-blue-600 text-white shadow-lg hover:shadow-xl',
    orange: 'bg-amber-600 text-white shadow-lg hover:shadow-xl',
    green: 'bg-emerald-600 text-white shadow-lg hover:shadow-xl',
    red: 'bg-rose-600 text-white shadow-lg hover:shadow-xl',
  };

  return (
    <Card className='min-h-36 relative overflow-hidden group'>
      <div className='absolute inset-0 bg-gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
      <div className='relative flex items-center justify-between gap-4'>
        <div className='flex-1 min-w-0'>
          <p className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2'>
            {title}
          </p>
          <p className='text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate'>
            {value}
          </p>
          {change && (
            <p className='mt-2 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
              {change}
            </p>
          )}
        </div>
        <div
          className={`flex-shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 ${tones[tone]}`}>
          <Icon size={28} />
        </div>
      </div>
    </Card>
  );
}
