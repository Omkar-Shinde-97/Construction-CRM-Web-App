import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Edit, Plus, Trash2 } from 'lucide-react';
import {
  BudgetAreaChart,
  DonutChart,
  ProfitLineChart,
} from '../../components/charts/Charts';
import { Avatar } from '../../components/shared/Avatar';
import { DataTable } from '../../components/shared/DataTable';
import { KPICard } from '../../components/shared/KPICard';
import { Progress } from '../../components/shared/Progress';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useDataStore } from '../../store/dataStore';
import { compactINR, percent } from '../../utils/formatters';
import { BarChart3, CircleDollarSign, IndianRupee, Wallet } from 'lucide-react';

const tabs = [
  'Overview',
  'Inventory',
  'Team',
  'Sales',
  'Expenses',
  'Documents',
  'Notes & Activity',
];

export function ProjectDetail() {
  const PROJECT_API_BASE_URL = 'http://localhost:8080/api/projects';
  const TOKEN =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJTVVBFUl9BRE1JTiIsImlhdCI6MTc4MjQ5OTMyOCwiZXhwIjoxNzgyNTg1NzI4fQ.TqD2ZR_F3_5l3ltZuWTL9RzNahTn6QxHcKHygjnoMEk';
  const { id } = useParams();
  const [tab, setTab] = useState('Overview');
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const employees = useDataStore((state) => state.employees);
  const transactions = useDataStore((state) => state.transactions);
  const expenses = useDataStore((state) => state.expenses);
  const documents = useDataStore((state) => state.documents);
  const monthlyFinancials = useDataStore((state) => state.monthlyFinancials);
  const activities = useDataStore((state) => state.activities);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${PROJECT_API_BASE_URL}/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API Error ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData.success) {
          setProject(responseData.data);
          console.log('Project Loaded:', responseData.data);
        } else {
          throw new Error(responseData.message || 'Failed to load project');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const projectManager = employees.find(
    (employee) => employee.id === project?.projectManager,
  );

  const team = employees.filter(
    (employee) =>
      project?.teamMembers?.includes(employee.id) ||
      employee.id === project?.projectManager,
  );
  const projectTransactions = project?.transactions ?? [];
  const projectExpenses = project?.expenses ?? [];
  const projectDocs = project?.documents ?? [];
  const projectActivities = project?.activities ?? [];
  const projectInventory = project?.inventories ?? [];

  const received = project?.totalReceived ?? 0;
  const contract = project?.totalContractValue ?? 0;
  const overdue = project?.totalOverdue ?? 0;
  const expenseBreakdown = [
    {
      name: 'Labor',
      value: project?.laborExpense ?? 0,
    },
    {
      name: 'Material',
      value: project?.materialExpense ?? 0,
    },
    {
      name: 'Equipment',
      value: project?.equipmentExpense ?? 0,
    },
    {
      name: 'Overhead',
      value: project?.overheadExpense ?? 0,
    },
  ];
  const areaData = useMemo(() => {
    if (!project) return [];

    return monthlyFinancials.slice(0, 6).map((item, index) => ({
      month: item.month,
      budget: (project.totalBudget / 6) * (index + 1),
      spent: (project.totalSpent / 6) * (index + 1),
    }));
  }, [project, monthlyFinancials]);

  if (loading) {
    return (
      <Card>
        <div className='p-6'>Loading project details...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className='p-6 text-red-500'>{error}</div>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <div className='p-6'>Project not found.</div>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <Card className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-extrabold dark:text-white'>
              {project.name}
            </h2>
            <Badge label={project.status} />
          </div>
          <p className='mt-1 text-slate-500'>
            {project.clientName} · {project.location}
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline'>
            <Edit size={17} /> Edit
          </Button>
          <Button variant='danger'>
            <Trash2 size={17} /> Delete
          </Button>
          <Button variant='secondary'>
            <Download size={17} /> Export PDF
          </Button>
        </div>
      </Card>

      <div className='grid gap-4 lg:grid-cols-4'>
        <Card>
          <div className='space-y-2'>
            <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>
              Category
            </p>
            <p className='font-semibold dark:text-white'>{project.category}</p>
          </div>
        </Card>
        <Card>
          <div className='space-y-2'>
            <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>
              Timeline
            </p>
            <p className='font-semibold dark:text-white'>
              {project.startDate} — {project.endDate}
            </p>
          </div>
        </Card>
        <Card>
          <div className='space-y-2'>
            <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>
              Project Manager
            </p>
            <p className='font-semibold dark:text-white'>
              {projectManager?.name ?? 'Unassigned'}
            </p>
          </div>
        </Card>
        <Card>
          <div className='space-y-2'>
            <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>
              Team size
            </p>
            <p className='font-semibold dark:text-white'>
              {project?.teamMembers?.length ?? 0} members
            </p>
          </div>
        </Card>
      </div>

      <div className='flex gap-2 overflow-x-auto rounded-xl bg-white p-2 shadow-soft dark:bg-slate-900 dark:shadow-none'>
        {tabs.map((item) => (
          <button
            key={item}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold ${tab === item ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <KPICard
              title='Budget'
              value={compactINR(project.totalBudget)}
              icon={IndianRupee}
            />
            <KPICard
              title='Spent'
              value={compactINR(project.totalSpent)}
              icon={Wallet}
              tone='orange'
            />
            <KPICard
              title='Remaining'
              value={compactINR(project.totalBudget - project.totalSpent)}
              icon={CircleDollarSign}
              tone='green'
            />
            <KPICard
              title='Completion'
              value={percent(project.completionPercentage)}
              icon={BarChart3}
              tone='green'
            />
          </div>
          <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
            <Card>
              <h3 className='mb-3 text-lg font-bold dark:text-white'>
                Budget vs Spent
              </h3>
              <BudgetAreaChart data={areaData} />
            </Card>
            <Card>
              <h3 className='mb-3 text-lg font-bold dark:text-white'>
                Milestones
              </h3>
              <div className='space-y-4'>
                {[
                  'Foundation',
                  'Structure',
                  'Interiors',
                  'Finishing',
                  'Handover',
                ].map((step, index) => (
                  <div key={step} className='flex gap-3'>
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${index * 22 < project.completionPercentage ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className='font-bold dark:text-white'>{step}</p>
                      <p className='text-sm text-slate-500'>
                        Scheduled checkpoint
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card>
            <h3 className='mb-2 text-lg font-bold dark:text-white'>
              Description
            </h3>
            <p className='text-slate-600 dark:text-slate-300'>
              {project.description}
            </p>
            <div className='mt-4'>
              <Progress value={project.completionPercentage} />
            </div>
          </Card>
        </div>
      )}
      {tab === 'Inventory' && (
        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-4'>
            <KPICard
              title='Total Inventory'
              value={String(projectInventory.length)}
              icon={BarChart3}
            />

            <KPICard
              title='Available'
              value={String(
                projectInventory.filter((item) => item.status === 'Available')
                  .length,
              )}
              icon={CircleDollarSign}
              tone='green'
            />

            <KPICard
              title='Sold'
              value={String(
                projectInventory.filter((item) => item.status === 'Sold')
                  .length,
              )}
              icon={Wallet}
              tone='orange'
            />

            <KPICard
              title='Blocked'
              value={String(
                projectInventory.filter((item) => item.status === 'Blocked')
                  .length,
              )}
              icon={IndianRupee}
              tone='red'
            />
          </div>

          <Card>
            <div className='mb-4 flex justify-between'>
              <h3 className='text-lg font-bold dark:text-white'>
                Inventory List
              </h3>

              <Button variant='secondary'>
                <Plus size={17} />
                Add Inventory
              </Button>
            </div>

            <DataTable
              data={projectInventory as unknown as Record<string, unknown>[]}
              searchKeys={['unitNo', 'type', 'status'] as never[]}
              columns={[
                {
                  key: 'unitNo',
                  header: 'Unit No',
                },
                {
                  key: 'type',
                  header: 'Type',
                },
                {
                  key: 'area',
                  header: 'Area',
                },
                {
                  key: 'price',
                  header: 'Price',
                  render: (row) => compactINR(Number(row.price)),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => <Badge label={String(row.status)} />,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (row) => (
                    <Button
                      variant='outline'
                      className='h-8'
                      onClick={() => navigate(`/inventory/${(row as any).id}`)}>
                      View
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === 'Team' && (
        <Card>
          <div className='mb-4 flex justify-between'>
            <h3 className='text-lg font-bold dark:text-white'>
              Assigned Employees
            </h3>
            <Button variant='secondary'>
              <Plus size={17} /> Assign Employee
            </Button>
          </div>
          <DataTable
            data={team as unknown as Record<string, unknown>[]}
            searchKeys={['name', 'role'] as never[]}
            columns={[
              {
                key: 'avatar',
                header: 'Photo',
                render: (row) => <Avatar label={String(row.avatar)} />,
              },
              { key: 'name', header: 'Name' },
              { key: 'role', header: 'Role' },
              { key: 'phone', header: 'Phone' },
              { key: 'email', header: 'Email' },
              { key: 'joinDate', header: 'Joined Date' },
              {
                key: 'actions',
                header: 'Actions',
                render: () => (
                  <Button variant='outline' className='h-8'>
                    View
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      )}

      {tab === 'Sales' && (
        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-4'>
            <KPICard
              title='Total Contract Value'
              value={compactINR(contract)}
              icon={IndianRupee}
            />
            <KPICard
              title='Received'
              value={compactINR(received)}
              icon={Wallet}
              tone='green'
            />
            <KPICard
              title='Pending'
              value={compactINR(contract - received)}
              icon={CircleDollarSign}
              tone='orange'
            />
            <KPICard
              title='Overdue'
              value={compactINR(overdue)}
              icon={CircleDollarSign}
              tone='red'
            />
          </div>
          <Card>
            <h3 className='mb-4 text-lg font-bold dark:text-white'>
              Payments Over Time
            </h3>
            <ProfitLineChart
              data={monthlyFinancials.slice(0, 6).map((item) => ({
                month: item.month,
                profit: item.revenue / 4,
              }))}
            />
          </Card>
          <Card>
            <div className='mb-4 flex justify-between'>
              <h3 className='text-lg font-bold dark:text-white'>
                Sales Transactions
              </h3>
              <Button variant='secondary'>
                <Plus size={17} /> Add Payment
              </Button>
            </div>
            <DataTable
              data={projectTransactions as unknown as Record<string, unknown>[]}
              columns={[
                { key: 'invoice', header: 'Invoice #' },
                { key: 'date', header: 'Date' },
                { key: 'description', header: 'Description' },
                {
                  key: 'amount',
                  header: 'Amount',
                  render: (row) => compactINR(Number(row.amount)),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => <Badge label={String(row.status)} />,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: () => (
                    <Button variant='outline' className='h-8'>
                      View
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === 'Expenses' && (
        <div className='grid gap-6 xl:grid-cols-[360px_1fr]'>
          <Card>
            <h3 className='mb-4 text-lg font-bold dark:text-white'>
              Expense Breakdown
            </h3>
            <DonutChart data={expenseBreakdown} />
          </Card>
          <Card>
            <div className='mb-4 flex justify-between'>
              <h3 className='text-lg font-bold dark:text-white'>Expenses</h3>
              <Button variant='secondary'>
                <Plus size={17} /> Add Expense
              </Button>
            </div>
            <DataTable
              data={projectExpenses as unknown as Record<string, unknown>[]}
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'category', header: 'Category' },
                { key: 'description', header: 'Description' },
                {
                  key: 'amount',
                  header: 'Amount',
                  render: (row) => compactINR(Number(row.amount)),
                },
                { key: 'addedBy', header: 'Added By' },
                { key: 'receipt', header: 'Receipt' },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === 'Documents' && (
        <Card>
          <div className='mb-5 rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700'>
            <p className='font-bold dark:text-white'>
              Drag and drop files here
            </p>
            <p className='text-sm text-slate-500'>
              Drawings, contracts, reports and photos
            </p>
          </div>
          <DataTable
            data={projectDocs as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'type', header: 'Type' },
              { key: 'size', header: 'Size' },
              { key: 'uploadedAt', header: 'Upload Date' },
              {
                key: 'actions',
                header: 'Actions',
                render: () => (
                  <Button variant='outline' className='h-8'>
                    Download
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      )}

      {tab === 'Notes & Activity' && (
        <Card>
          <textarea
            className='mb-3 min-h-28 w-full rounded-lg border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-950'
            placeholder='Add a note...'
          />
          <Button variant='secondary'>Submit Note</Button>
          <div className='mt-6 space-y-4'>
            {activities.map((activity) => (
              <div
                key={activity.id}
                className='border-l-2 border-secondary pl-4'>
                <p className='font-semibold dark:text-white'>
                  {activity.message}
                </p>
                <p className='text-sm text-slate-500'>
                  {new Date(activity.date).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
