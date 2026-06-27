import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { MobileNav, Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';

export function Layout() {
  const { darkMode, sidebarCollapsed } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 text-app-text dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 dark:text-slate-100'>
      <Sidebar />
      <main
        className={cn(
          'min-h-screen pb-24 transition-all lg:pb-0',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[260px]',
        )}>
        <Header />
        <div className='p-4 sm:p-6'>
          <Outlet />
        </div>
      </main>
      <MobileNav />
      <ToastContainer />
    </div>
  );
}
