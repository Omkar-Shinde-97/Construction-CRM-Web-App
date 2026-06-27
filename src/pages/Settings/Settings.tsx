import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Moon, Sun } from 'lucide-react';
import { z } from 'zod';
import { useAppStore } from '../../store/appStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const tabs = [
  'Company Profile',
  'User Management',
  'Roles & Permissions',
  'Notifications',
  'Appearance',
] as const;

const companySchema = z.object({
  companyName: z.string().min(2),
  address: z.string().min(5),
  gst: z.string().min(5),
});

export function Settings() {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>('Company Profile');
  const { darkMode, toggleDarkMode } = useAppStore();
  const form = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: 'BuildCRM Pvt Ltd',
      address: '2nd Floor, Corporate Tower, Mumbai',
      gst: '27AABCU9603R1ZV',
    },
  });

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <p className='text-sm font-semibold uppercase tracking-[0.2em] text-secondary'>
          Settings
        </p>
        <h2 className='text-2xl font-extrabold dark:text-white'>
          Application Settings
        </h2>
      </div>
      <Card>
        <div className='flex flex-wrap gap-2 border-b border-slate-200 pb-4 dark:border-slate-800'>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <div className='mt-6 space-y-6'>
          {activeTab === 'Company Profile' && (
            <form
              className='grid gap-4 md:grid-cols-2'
              onSubmit={form.handleSubmit(() => {})}>
              <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
                <span>Company Name</span>
                <input
                  {...form.register('companyName')}
                  className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'
                />
              </label>
              <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
                <span>Address</span>
                <input
                  {...form.register('address')}
                  className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'
                />
              </label>
              <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
                <span>GST Number</span>
                <input
                  {...form.register('gst')}
                  className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'
                />
              </label>
              <div className='md:col-span-2 flex justify-end'>
                <Button type='submit' variant='secondary'>
                  Save Company Profile
                </Button>
              </div>
            </form>
          )}
          {activeTab === 'User Management' && (
            <div className='space-y-4'>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Manage admin users and access levels for the BuildCRM platform.
              </p>
              <div className='grid gap-4 md:grid-cols-3'>
                {[
                  {
                    name: 'Omkar Shinde',
                    role: 'Administrator',
                    email: 'omkar@buildcrm.in',
                  },
                  {
                    name: 'Ananya Rao',
                    role: 'Project Lead',
                    email: 'ananya@buildcrm.in',
                  },
                  {
                    name: 'Kabir Shah',
                    role: 'Finance Manager',
                    email: 'kabir@buildcrm.in',
                  },
                ].map((user) => (
                  <Card key={user.email} className='p-4'>
                    <p className='font-semibold dark:text-white'>{user.name}</p>
                    <p className='text-sm text-slate-500 dark:text-slate-400'>
                      {user.email}
                    </p>
                    <p className='mt-3 text-sm text-slate-600 dark:text-slate-300'>
                      {user.role}
                    </p>
                    <Button variant='outline' className='mt-4 w-full'>
                      Manage
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'Roles & Permissions' && (
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[720px] text-left text-sm'>
                <thead className='bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400'>
                  <tr>
                    <th className='px-4 py-3'>Role</th>
                    <th className='px-4 py-3'>Dashboard</th>
                    <th className='px-4 py-3'>Projects</th>
                    <th className='px-4 py-3'>Finance</th>
                    <th className='px-4 py-3'>Documents</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
                  {['Admin', 'Project Manager', 'Accountant'].map((role) => (
                    <tr
                      key={role}
                      className='hover:bg-slate-50 dark:hover:bg-slate-800/40'>
                      <td className='px-4 py-3 font-semibold dark:text-white'>
                        {role}
                      </td>
                      <td className='px-4 py-3'>
                        {role === 'Accountant' ? 'Yes' : 'Yes'}
                      </td>
                      <td className='px-4 py-3'>
                        {role === 'Accountant' ? 'Read' : 'Full'}
                      </td>
                      <td className='px-4 py-3'>
                        {role === 'Project Manager' ? 'Read' : 'Full'}
                      </td>
                      <td className='px-4 py-3'>Full</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'Notifications' && (
            <div className='grid gap-4 md:grid-cols-2'>
              {[
                { label: 'Project updates', enabled: true },
                { label: 'Finance reminders', enabled: false },
                { label: 'Document approvals', enabled: true },
                { label: 'Sales alerts', enabled: true },
              ].map((item) => (
                <div
                  key={item.label}
                  className='flex items-center justify-between rounded-3xl border border-slate-200 p-4 dark:border-slate-800'>
                  <div>
                    <p className='font-semibold dark:text-white'>
                      {item.label}
                    </p>
                    <p className='text-sm text-slate-500 dark:text-slate-400'>
                      Receive notifications for {item.label.toLowerCase()}.
                    </p>
                  </div>
                  <Button variant={item.enabled ? 'secondary' : 'outline'}>
                    {item.enabled ? 'On' : 'Off'}
                  </Button>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'Appearance' && (
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-3xl border border-slate-200 p-6 dark:border-slate-800'>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  Theme
                </p>
                <div className='mt-4 flex items-center gap-3'>
                  <Button
                    variant={darkMode ? 'outline' : 'secondary'}
                    onClick={() => !darkMode && toggleDarkMode()}>
                    <Sun size={18} /> Light
                  </Button>
                  <Button
                    variant={darkMode ? 'secondary' : 'outline'}
                    onClick={() => darkMode && toggleDarkMode()}>
                    <Moon size={18} /> Dark
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
