import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { KPICard } from '../../components/shared/KPICard';
import { formatINR, percent } from '../../utils/formatters';

const periods = ['Monthly', 'Quarterly', 'Yearly'];

export function Finance() {
  const [period, setPeriod] = useState('Monthly');
  const projects = useDataStore((state) => state.projects);

  const totals = useMemo(() => {
    const revenue = projects.reduce((sum, project) => sum + project.budget, 0);
    const expenses = projects.reduce((sum, project) => sum + project.spent, 0);
    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      margin: revenue === 0 ? 0 : ((revenue - expenses) / revenue) * 100,
    };
  }, [projects]);

  const statement = useMemo(
    () =>
      projects.map((project) => ({
        name: project.name,
        revenue: project.budget,
        expenses: project.spent,
        grossProfit: project.budget - project.spent,
        netProfit: project.budget - project.spent,
        margin:
          project.budget === 0
            ? 0
            : ((project.budget - project.spent) / project.budget) * 100,
        status: project.budget - project.spent >= 0 ? 'Profitable' : 'Loss',
      })),
    [projects],
  );

  const chartData = useMemo(
    () =>
      projects
        .slice(0, 6)
        .map((project, index) => ({
          name: project.name,
          revenue: project.budget,
          expenses: project.spent,
          net: project.budget - project.spent,
        })),
    [projects],
  );

  const waterfall = [
    { label: 'Revenue', value: totals.revenue },
    { label: 'Expenses', value: -totals.expenses },
    { label: 'Net Profit', value: totals.profit },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='space-y-2'>
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-secondary'>
            P&L
          </p>
          <h2 className='text-2xl font-extrabold dark:text-white'>Finance</h2>
        </div>
        <div className='flex flex-wrap gap-3'>
          {periods.map((item) => (
            <Button
              key={item}
              variant={period === item ? 'secondary' : 'outline'}
              onClick={() => setPeriod(item)}>
              {item}
            </Button>
          ))}
          <Button variant='secondary'>Export PDF</Button>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-4'>
        <KPICard
          title='Total Revenue'
          value={formatINR(totals.revenue)}
          icon={DollarSign}
        />
        <KPICard
          title='Total Expenses'
          value={formatINR(totals.expenses)}
          icon={Wallet}
          tone='orange'
        />
        <KPICard
          title='Gross Profit'
          value={formatINR(totals.profit)}
          icon={TrendingUp}
          tone='green'
        />
        <KPICard
          title='Net Margin'
          value={percent(totals.margin)}
          icon={TrendingUp}
          tone='green'
        />
      </div>

      <div className='grid gap-6 xl:grid-cols-[1fr_0.8fr]'>
        <Card>
          <h3 className='mb-4 text-lg font-bold dark:text-white'>
            Revenue vs Expense per Project
          </h3>
          <ResponsiveContainer width='100%' height={280}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis dataKey='name' tick={{ fill: '#475569' }} />
              <YAxis
                tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                width={60}
              />
              <Tooltip formatter={(value: number) => formatINR(value)} />
              <Legend />
              <Bar dataKey='revenue' fill='#1E3A5F' />
              <Bar dataKey='expenses' fill='#F97316' />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className='mb-4 text-lg font-bold dark:text-white'>
            Net Profit Trend
          </h3>
          <ResponsiveContainer width='100%' height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis dataKey='name' tick={{ fill: '#475569' }} />
              <YAxis tickFormatter={(value) => formatINR(value)} width={60} />
              <Tooltip formatter={(value: number) => formatINR(value)} />
              <Line
                type='monotone'
                dataKey='net'
                stroke='#22C55E'
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-bold dark:text-white'>P&L Statement</h3>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Summary by project with margin and performance insight.
            </p>
          </div>
          <Badge label='Profitable' />
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[900px] text-left text-sm'>
            <thead className='bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400'>
              <tr>
                <th className='px-4 py-3'>Project Name</th>
                <th className='px-4 py-3'>Contract Value</th>
                <th className='px-4 py-3'>Total Expenses</th>
                <th className='px-4 py-3'>Gross Profit</th>
                <th className='px-4 py-3'>Net Profit</th>
                <th className='px-4 py-3'>Margin %</th>
                <th className='px-4 py-3'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
              {statement.map((row) => (
                <tr
                  key={row.name}
                  className='hover:bg-slate-50 dark:hover:bg-slate-800/40'>
                  <td className='px-4 py-3 font-semibold dark:text-white'>
                    {row.name}
                  </td>
                  <td className='px-4 py-3'>{formatINR(row.revenue)}</td>
                  <td className='px-4 py-3'>{formatINR(row.expenses)}</td>
                  <td className='px-4 py-3'>{formatINR(row.grossProfit)}</td>
                  <td className='px-4 py-3'>{formatINR(row.netProfit)}</td>
                  <td className='px-4 py-3'>{percent(row.margin)}</td>
                  <td className='px-4 py-3'>
                    <Badge label={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className='mb-4 text-lg font-bold dark:text-white'>
          Waterfall Overview
        </h3>
        <div className='grid gap-4 sm:grid-cols-3'>
          {waterfall.map((item) => (
            <div
              key={item.label}
              className='rounded-3xl border border-slate-200 p-5 dark:border-slate-800'>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                {item.label}
              </p>
              <p className='mt-3 text-2xl font-semibold dark:text-white'>
                {item.value < 0
                  ? `- ${formatINR(Math.abs(item.value))}`
                  : formatINR(item.value)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
