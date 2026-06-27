import {
  BarChart3,
  Briefcase,
  IndianRupee,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  activities,
  employees,
  monthlyFinancials,
  projects,
} from '../../data/mockData';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  DonutChart,
  ProfitLineChart,
  RevenueExpenseChart,
} from '../../components/charts/Charts';
import { KPICard } from '../../components/shared/KPICard';
import { Progress } from '../../components/shared/Progress';
import { compactINR, percent } from '../../utils/formatters';

export function Dashboard() {
  const totalRevenue = monthlyFinancials.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const totalExpenses = monthlyFinancials.reduce(
    (sum, item) => sum + item.expenses,
    0,
  );
  const statuses = ['Planning', 'In Progress', 'On Hold', 'Completed'].map(
    (status) => ({
      name: status,
      value: projects.filter((project) => project.status === status).length,
    }),
  );

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <KPICard
          title='Total Active Projects'
          value={String(
            projects.filter((project) => project.status === 'In Progress')
              .length,
          )}
          change='+12% vs last month'
          icon={Briefcase}
        />
        <KPICard
          title='Total Revenue This Year'
          value={compactINR(totalRevenue)}
          change='+18% revenue growth'
          icon={IndianRupee}
          tone='orange'
        />
        <KPICard
          title='Total Employees'
          value={String(employees.length)}
          change='+3 new hires'
          icon={Users}
          tone='green'
        />
        <KPICard
          title='Overall Profit Margin'
          value={percent(((totalRevenue - totalExpenses) / totalRevenue) * 100)}
          change='+4.2% improvement'
          icon={TrendingUp}
          tone='green'
        />
      </div>

      <div className='grid gap-6 xl:grid-cols-[1.5fr_0.9fr]'>
        <Card className='overflow-hidden'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent'>
              Monthly Revenue vs Expenses
            </h2>
            <div className='text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full'>
              Last 12 months
            </div>
          </div>
          <RevenueExpenseChart data={monthlyFinancials} />
        </Card>
        <Card className='overflow-hidden'>
          <h2 className='mb-6 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent'>
            Project Status Breakdown
          </h2>
          <DonutChart data={statuses} />
        </Card>
      </div>

      <div className='grid gap-6 xl:grid-cols-[1fr_360px]'>
        <div className='space-y-6'>
          <Card className='overflow-hidden'>
            <h2 className='mb-6 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent'>
              Profit Trend
            </h2>
            <ProfitLineChart data={monthlyFinancials.slice(-6)} />
          </Card>
          <Card className='overflow-hidden'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent'>
                Recent Projects
              </h2>
              <div className='text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full'>
                Top 5
              </div>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[700px] text-sm'>
                <tbody className='divide-y divide-slate-100/50 dark:divide-slate-700/50'>
                  {projects.slice(0, 5).map((project) => (
                    <tr
                      key={project.id}
                      className='hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors'>
                      <td className='py-4 px-2 font-semibold text-slate-900 dark:text-white'>
                        {project.name}
                      </td>
                      <td className='px-2'>
                        <Badge label={project.status} />
                      </td>
                      <td className='px-2 text-slate-600 dark:text-slate-400'>
                        {
                          employees.find(
                            (employee) => employee.id === project.managerId,
                          )?.name
                        }
                      </td>
                      <td className='px-2 font-semibold text-slate-900 dark:text-white'>
                        {compactINR(project.budget)}
                      </td>
                      <td className='w-40 px-2'>
                        <Progress value={project.completion} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className='overflow-hidden'>
            <h2 className='mb-6 flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent'>
              <BarChart3 size={20} /> Top Performing Employees
            </h2>
            <div className='grid gap-3 sm:grid-cols-2'>
              {employees.slice(0, 5).map((employee) => (
                <div
                  key={employee.id}
                  className='rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4 hover:shadow-md hover:border-primary/50 transition-all duration-200 bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-800/30 dark:to-slate-800/10'>
                  <p className='font-bold text-slate-900 dark:text-white'>
                    {employee.name}
                  </p>
                  <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
                    {employee.role} · {employee.projectsCompleted} projects
                  </p>
                  <div className='mt-2 flex items-center gap-0.5 text-yellow-400'>
                    {'★'.repeat(Math.round(employee.rating))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card className='overflow-hidden flex flex-col'>
          <h2 className='mb-6 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent'>
            Activity Feed
          </h2>
          <div className='space-y-5 flex-1'>
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`relative pl-4 pb-2 ${index !== activities.length - 1 ? 'border-l-2 border-primary/30' : 'border-l-2 border-primary'}`}>
                <span className='absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full bg-gradient-primary shadow-glow' />
                <p className='text-sm font-semibold text-slate-900 dark:text-white'>
                  {activity.message}
                </p>
                <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                  {new Date(activity.date).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
