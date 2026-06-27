import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Moon, Search, Sun } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../shared/Avatar';
import { Button } from '../ui/Button';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/employees': 'Employees',
  '/sales': 'Sales',
  '/finance': 'Finance',
  '/pipeline': 'Upcoming Projects',
  '/documents': 'Documents',
  '/settings': 'Settings',
};

export function Header() {
  const { pathname } = useLocation();
  const { darkMode, toggleDarkMode } = useAppStore();
  const title = useMemo(() => {
    if (pathname.startsWith('/projects/')) return 'Project Detail';
    if (pathname.startsWith('/employees/')) return 'Employee Profile';
    return titles[pathname] ?? 'BuildCRM';
  }, [pathname]);
  const crumbs = pathname.split('/').filter(Boolean);

  return (
    <header className='sticky top-0 z-20 border-b border-slate-200/30 bg-white/40 backdrop-blur-xl px-4 py-4 dark:border-slate-700/30 dark:bg-slate-900/40 sm:px-6 transition-all'>
      <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
        <div>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent'>
            {title}
          </h1>
          <div className='mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
            <Link to='/' className='hover:text-primary transition-colors'>
              Home
            </Link>
            {crumbs.map((crumb, index) => (
              <span key={crumb} className='flex items-center gap-2'>
                /
                <span
                  className={
                    index === crumbs.length - 1
                      ? 'font-semibold text-primary'
                      : ''
                  }>
                  {crumb.replace('-', ' ')}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <label className='relative min-w-0 flex-1 sm:w-72 sm:flex-none'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
              size={18}
            />
            <input
              aria-label='Global search'
              className='h-11 w-full rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700/50 dark:bg-slate-900/50 transition-all'
              placeholder='Search projects, clients, invoices...'
            />
          </label>
          <Button
            variant='ghost'
            className='h-11 w-11 px-0 transition-transform hover:rotate-12'
            onClick={toggleDarkMode}
            aria-label='Toggle dark mode'>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button
            variant='ghost'
            className='relative h-11 w-11 px-0 transition-transform hover:scale-110'
            aria-label='Notifications'>
            <Bell size={18} />
            <span className='absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse-glow' />
          </Button>
          <div className='flex items-center gap-2 rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm px-2 py-1.5 dark:border-slate-700/50 dark:bg-slate-900/50 transition-all hover:shadow-md'>
            <Avatar label='OS' size='sm' />
            <span className='hidden text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent sm:inline'>
              Profile
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
