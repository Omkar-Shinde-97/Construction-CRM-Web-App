import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { compactINR } from '../../utils/formatters';

const colors = [
  '#1e40af',
  '#0369a1',
  '#0891b2',
  '#0d9488',
  '#7c3aed',
  '#dc2626',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='rounded-xl bg-white/90 backdrop-blur-xl border border-white/20 p-3 shadow-lg'>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className='text-sm font-semibold'>
            {entry.name}:{' '}
            {typeof entry.value === 'number'
              ? compactINR(entry.value)
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueExpenseChart({
  data,
}: {
  data: { month: string; revenue: number; expenses: number }[];
}) {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#0066FF' stopOpacity={0.9} />
            <stop offset='95%' stopColor='#0066FF' stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id='colorExpenses' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#FF6B35' stopOpacity={0.9} />
            <stop offset='95%' stopColor='#FF6B35' stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray='3 3'
          vertical={false}
          stroke='rgba(0,0,0,0.06)'
        />
        <XAxis
          dataKey='month'
          stroke='#94A3B8'
          style={{ fontSize: '12px', fontWeight: '500' }}
        />
        <YAxis
          tickFormatter={compactINR}
          width={60}
          stroke='#94A3B8'
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar
          dataKey='revenue'
          fill='url(#colorRevenue)'
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey='expenses'
          fill='url(#colorExpenses)'
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width='100%' height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey='value'
          nameKey='name'
          innerRadius={70}
          outerRadius={110}
          paddingAngle={4}
          startAngle={90}
          endAngle={-270}>
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ProfitLineChart({
  data,
}: {
  data: { month: string; profit: number }[];
}) {
  return (
    <ResponsiveContainer width='100%' height={280}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id='colorProfit' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#00D084' stopOpacity={0.9} />
            <stop offset='95%' stopColor='#00D084' stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray='3 3'
          vertical={false}
          stroke='rgba(0,0,0,0.06)'
        />
        <XAxis
          dataKey='month'
          stroke='#94A3B8'
          style={{ fontSize: '12px', fontWeight: '500' }}
        />
        <YAxis
          tickFormatter={compactINR}
          width={60}
          stroke='#94A3B8'
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type='monotone'
          dataKey='profit'
          stroke='#00D084'
          strokeWidth={3}
          dot={{ r: 5, fill: '#00D084' }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BudgetAreaChart({
  data,
}: {
  data: { month: string; budget: number; spent: number }[];
}) {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id='colorBudget' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#0066FF' stopOpacity={0.8} />
            <stop offset='95%' stopColor='#0066FF' stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id='colorSpent' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#FF6B35' stopOpacity={0.8} />
            <stop offset='95%' stopColor='#FF6B35' stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray='3 3'
          vertical={false}
          stroke='rgba(0,0,0,0.06)'
        />
        <XAxis
          dataKey='month'
          stroke='#94A3B8'
          style={{ fontSize: '12px', fontWeight: '500' }}
        />
        <YAxis
          tickFormatter={compactINR}
          width={60}
          stroke='#94A3B8'
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type='monotone'
          dataKey='budget'
          stroke='#0066FF'
          fill='url(#colorBudget)'
        />
        <Area
          type='monotone'
          dataKey='spent'
          stroke='#FF6B35'
          fill='url(#colorSpent)'
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
