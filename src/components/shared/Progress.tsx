export function Progress({ value }: { value: number }) {
  return (
    <div
      className='h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 shadow-inner'
      aria-label={`${value}% complete`}>
      <div
        className='h-full rounded-full bg-gradient-to-r from-primary to-accent shadow-glow transition-all duration-500'
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
