import { useMemo, useState } from 'react';
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TanStackDataTable } from '../../components/shared/TanStackDataTable';
import { KPICard } from '../../components/shared/KPICard';
import { formatINR } from '../../utils/formatters';

const colors = ['#1e40af', '#0369a1', '#0891b2', '#0d9488', '#7c3aed'];

export function Sales() {
  const transactions = useDataStore((state) => state.transactions);
  const projects = useDataStore((state) => state.projects);
  const [statusFilter, setStatusFilter] = useState('All');

  const summary = useMemo(() => {
    const totalSales = transactions.reduce((sum, item) => sum + item.amount, 0);
    const collected = transactions.reduce(
      (sum, item) => sum + item.collected,
      0,
    );
    const pending = totalSales - collected;
    const overdue = transactions
      .filter((item) => item.status === 'Overdue')
      .reduce((sum, item) => sum + (item.amount - item.collected), 0);
    return { totalSales, collected, pending, overdue };
  }, [transactions]);

  const monthlySales = useMemo(
    () =>
      Object.values(
        transactions.reduce<
          Record<string, { month: string; collected: number }>
        >((acc, item) => {
          const month = item.date.slice(0, 7);
          if (!acc[month]) acc[month] = { month, collected: 0 };
          acc[month].collected += item.collected;
          return acc;
        }, {}),
      )
        .map((item) => ({ month: item.month, collected: item.collected }))
        .slice(-12),
    [transactions],
  );

  const salesByProject = useMemo(() => {
    const grouped = transactions.reduce<Record<string, number>>((acc, item) => {
      const project = projects.find((project) => project.id === item.projectId);
      const label = project ? project.name : item.projectId;
      acc[label] = (acc[label] || 0) + item.amount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [projects, transactions]);

  const filteredTransactions = useMemo(
    () =>
      statusFilter === 'All'
        ? transactions
        : transactions.filter((item) => item.status === statusFilter),
    [statusFilter, transactions],
  );

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-4'>
        <KPICard
          title='Total Sales This Year'
          value={formatINR(summary.totalSales)}
          icon={DollarSign}
        />
        <KPICard
          title='Collected Amount'
          value={formatINR(summary.collected)}
          icon={TrendingUp}
          tone='green'
        />
        <KPICard
          title='Pending Amount'
          value={formatINR(summary.pending)}
          icon={DollarSign}
          tone='orange'
        />
        <KPICard
          title='Overdue Amount'
          value={formatINR(summary.overdue)}
          icon={TrendingUp}
          tone='red'
        />
      </div>

      <Card className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
        <div>
          <h2 className='mb-4 text-lg font-bold dark:text-white'>
            Monthly Sales Collection
          </h2>
          <ResponsiveContainer width='100%' height={280}>
            <BarChart
              data={monthlySales}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis dataKey='month' tick={{ fill: '#475569' }} />
              <YAxis
                tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                width={62}
              />
              <Tooltip formatter={(value: number) => formatINR(value)} />
              <Bar dataKey='collected' fill='#1E3A5F' radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h2 className='mb-4 text-lg font-bold dark:text-white'>
            Sales by Project
          </h2>
          <ResponsiveContainer width='100%' height={280}>
            <PieChart>
              <Pie
                data={salesByProject}
                dataKey='value'
                nameKey='name'
                outerRadius={90}
                innerRadius={50}
                paddingAngle={4}>
                {salesByProject.map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatINR(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className='mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h3 className='text-lg font-bold dark:text-white'>Sales Table</h3>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              All invoice and payment statuses for active projects.
            </p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <select
              className='h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}>
              <option>All</option>
              <option>Paid</option>
              <option>Partial</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
            <Button variant='secondary'>Send Reminder</Button>
          </div>
        </div>
        <TanStackDataTable
          data={filteredTransactions as unknown as Record<string, unknown>[]}
          columns={[
            {
              header: 'Project',
              accessorKey: 'projectId',
              cell: (info) =>
                projects.find((project) => project.id === info.getValue())
                  ?.name ?? String(info.getValue()),
            },
            { header: 'Invoice #', accessorKey: 'invoice' },
            { header: 'Due Date', accessorKey: 'dueDate' },
            {
              header: 'Amount',
              accessorKey: 'amount',
              cell: (info) => formatINR(Number(info.getValue())),
            },
            {
              header: 'Collected',
              accessorKey: 'collected',
              cell: (info) => formatINR(Number(info.getValue())),
            },
            {
              header: 'Status',
              accessorKey: 'status',
              cell: (info) => <Badge label={String(info.getValue())} />,
            },
            {
              header: 'Actions',
              accessorKey: 'invoice',
              cell: () => (
                <Button variant='outline' className='h-8'>
                  View
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
