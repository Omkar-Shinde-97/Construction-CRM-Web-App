import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  ChevronLeft,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import { Avatar } from '../shared/Avatar';
import { Button } from '../ui/Button';

const nav = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Projects', path: '/projects', icon: Building2 },
  { label: 'Employees', path: '/employees', icon: Users },
  { label: 'Sales', path: '/sales', icon: Briefcase },
  { label: 'Finance (P&L)', path: '/finance', icon: BarChart3 },
  { label: 'Upcoming Projects', path: '/pipeline', icon: ClipboardList },
  { label: 'Documents', path: '/documents', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-slate-200/30 bg-white/40 backdrop-blur-xl transition-all dark:border-slate-700/30 dark:bg-slate-900/40 lg:flex',
        sidebarCollapsed ? 'w-20' : 'w-[260px]',
      )}>
      <div className='flex h-20 items-center justify-between px-5'>
        <div className='flex items-center gap-3'>
          <div className='grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-white font-bold text-lg'>
            <Building2 />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className='text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent'>
                BuildCRM
              </p>
              <p className='text-xs font-semibold text-primary'>
                Construction OS
              </p>
            </div>
          )}
        </div>
        <Button
          variant='ghost'
          className='h-9 w-9 px-0 transition-transform hover:rotate-180'
          onClick={toggleSidebar}
          aria-label='Toggle sidebar'>
          <ChevronLeft
            className={cn(
              'transition-transform',
              sidebarCollapsed && 'rotate-180',
            )}
            size={18}
          />
        </Button>
      </div>
      <nav className='flex-1 space-y-1 px-3 py-4'>
        {nav.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-slate-800/50',
                isActive &&
                  'bg-gradient-primary text-white shadow-glow hover:bg-gradient-primary dark:text-white dark:hover:bg-primary',
              )
            }>
            <Icon size={19} />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className='border-t border-slate-200/30 p-4 dark:border-slate-700/30'>
        <div className='flex items-center gap-3'>
          <Avatar label='OS' />
          {!sidebarCollapsed && (
            <>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-bold text-slate-900 dark:text-white'>
                  Omkar Shinde
                </p>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Admin
                </p>
              </div>
              <LogOut
                size={18}
                className='text-slate-400 hover:text-primary transition-colors'
              />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className='fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-slate-200/30 bg-white/40 backdrop-blur-xl px-2 py-2 dark:border-slate-700/30 dark:bg-slate-900/40 lg:hidden'>
      {nav.slice(0, 5).map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 rounded-lg py-2 px-1 text-[10px] font-bold text-slate-500 transition-all duration-200 hover:text-primary',
              isActive &&
                'bg-gradient-to-br from-primary to-accent text-white shadow-glow dark:shadow-none',
            )
          }>
          <Icon size={18} />
          <span className='max-w-16 truncate'>
            {label.replace(' (P&L)', '')}
          </span>
        </NavLink>
      ))}
      <Bell className='hidden' />
    </nav>
  );
}
