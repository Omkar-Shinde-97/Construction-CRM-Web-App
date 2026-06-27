import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Grid2X2, List, Plus, Trash2 } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';
import { Progress } from '../../components/shared/Progress';
import { compactINR } from '../../utils/formatters';

interface ApiProject {
  id: string;
  projectCode: string;
  name: string;
  clientName: string;
  category: string;
  status: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  contractValue: number;
  completionPercentage: number;
  coverImageUrl: string | null;
}

interface ProjectsApiResponse {
  success: boolean;
  message: string;
  data: {
    content: ApiProject[];
  };
}

export function ProjectsList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const employees = useDataStore((state) => state.employees);
  const navigate = useNavigate();
  const [view, setView] = useState<'table' | 'grid'>('grid');
  const [status, setStatus] = useState('All');
  const [query, setQuery] = useState('');

  const PROJECTS_API_URL = 'http://localhost:8080/api/projects';

  const TOKEN =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJTVVBFUl9BRE1JTiIsImlhdCI6MTc4MjQ4MjA4NywiZXhwIjoxNzgyNTY4NDg3fQ.RbWp8ITKf12gwHBA82mWlC_vNhC2PHUoVrZTsFCgCtw';
  const DEFAULT_PROJECT_IMAGE =
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200';

  const filtered = useMemo(() => {
    return projects
      .filter((project) => status === 'All' || project.status === status)
      .filter(
        (project) =>
          project.name.toLowerCase().includes(query.toLowerCase()) ||
          project.client.toLowerCase().includes(query.toLowerCase()),
      );
  }, [projects, query, status]);

  const mapStatus = (
    status: string,
  ): 'Planning' | 'In Progress' | 'On Hold' | 'Completed' => {
    switch (status) {
      case 'PLANNING':
        return 'Planning';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'ON_HOLD':
        return 'On Hold';
      case 'COMPLETED':
        return 'Completed';
      default:
        return 'Planning';
    }
  };

  const mapApiProject = (project: ApiProject) => ({
    id: project.id,
    name: project.name,
    client: project.clientName,
    category: project.category,
    location: project.location,
    startDate: project.startDate,
    endDate: project.endDate,
    status: mapStatus(project.status),
    budget: Number(project.totalBudget),
    spent: Number(project.contractValue),
    completion: project.completionPercentage ?? 0,
    managerId: '',
    teamIds: [],
    description: project.description ?? '',
    cover: project.coverImageUrl || DEFAULT_PROJECT_IMAGE,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(PROJECTS_API_URL, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load projects (${response.status})`);
        }

        const result = (await response.json()) as ProjectsApiResponse;

        if (!result.success) {
          throw new Error('Failed to load projects');
        }

        setProjects(result.data.content.map(mapApiProject));
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setError(
          err instanceof Error ? err.message : 'Failed to load projects',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();

    return () => controller.abort();
  }, []);

  return (
    <div className='space-y-6'>
      <Card className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='grid flex-1 gap-3 md:grid-cols-4'>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className='h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950'
            placeholder='Search projects...'
          />
          <select
            className='h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950'
            value={status}
            onChange={(event) => setStatus(event.target.value)}>
            {['All', 'Planning', 'In Progress', 'On Hold', 'Completed'].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>
          <select className='h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950'>
            <option>All Categories</option>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Infrastructure</option>
            <option>Retail</option>
            <option>Healthcare</option>
          </select>
          <select className='h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950'>
            <option>All Managers</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
        <div className='flex gap-2'>
          <Button
            variant={view === 'table' ? 'primary' : 'outline'}
            onClick={() => setView('table')}
            aria-label='Table view'>
            <List size={18} />
          </Button>
          <Button
            variant={view === 'grid' ? 'primary' : 'outline'}
            onClick={() => setView('grid')}
            aria-label='Grid view'>
            <Grid2X2 size={18} />
          </Button>
          <Link to='/projects/new'>
            <Button variant='secondary'>
              <Plus size={18} /> New Project
            </Button>
          </Link>
        </div>
      </Card>

      {view === 'table' ? (
        <Card>
          <DataTable
            data={filtered as unknown as Record<string, unknown>[]}
            rowKey='id'
            onRowClick={(row) => navigate(`/projects/${(row as any).id}`)}
            searchKeys={['name', 'client', 'category'] as never[]}
            columns={[
              { key: 'id', header: 'Project ID' },
              {
                key: 'name',
                header: 'Project Name',
                render: (row) => (
                  <span className='font-bold text-primary dark:text-blue-300'>
                    {String(row.name)}
                  </span>
                ),
              },
              { key: 'client', header: 'Client Name' },
              { key: 'category', header: 'Category' },
              { key: 'startDate', header: 'Start Date' },
              { key: 'endDate', header: 'End Date' },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <Badge label={String(row.status)} />,
              },
              {
                key: 'budget',
                header: 'Budget',
                render: (row) => compactINR(Number(row.budget)),
              },
              {
                key: 'spent',
                header: 'Spent',
                render: (row) => compactINR(Number(row.spent)),
              },
              {
                key: 'completion',
                header: 'Completion',
                render: (row) => (
                  <div className='w-32'>
                    <Progress value={Number(row.completion)} />
                  </div>
                ),
              },
              {
                key: 'managerId',
                header: 'Manager',
                render: (row) =>
                  employees.find((employee) => employee.id === row.managerId)
                    ?.name,
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <div className='flex gap-2'>
                    <Link to={`/projects/${row.id}`}>
                      <Eye size={17} />
                    </Link>
                    <Trash2 size={17} className='text-red-500' />
                  </div>
                ),
              },
            ]}
          />
        </Card>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
          {filtered.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className='card overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-2 cursor-pointer group'>
              <div className='relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700'>
                <img
                  src={project.cover}
                  alt={project.name}
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
                <Badge
                  label={project.status}
                  className='absolute top-3 right-3 shadow-lg'
                />
              </div>
              <div className='space-y-4 p-6'>
                <div>
                  <h2 className='text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors'>
                    {project.name}
                  </h2>
                  <p className='text-sm text-slate-600 dark:text-slate-400 mt-1'>
                    {project.client}
                  </p>
                </div>

                <div className='flex items-center gap-2 text-xs font-semibold'>
                  <div className='px-2 py-1 rounded-lg bg-blue-50/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'>
                    {project.category}
                  </div>
                  <div className='px-2 py-1 rounded-lg bg-purple-50/50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300'>
                    {employees.find((emp) => emp.id === project.managerId)
                      ?.name || 'Unassigned'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-xs'>
                    <span className='text-slate-600 dark:text-slate-400'>
                      Progress
                    </span>
                    <span className='font-bold text-primary'>
                      {project.completion}%
                    </span>
                  </div>
                  <Progress value={project.completion} />
                </div>

                <div className='grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50'>
                  <div>
                    <p className='text-xs text-slate-500 dark:text-slate-400 mb-1'>
                      Budget
                    </p>
                    <p className='font-bold text-slate-900 dark:text-white text-sm'>
                      {compactINR(project.budget)}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-slate-500 dark:text-slate-400 mb-1'>
                      Spent
                    </p>
                    <p className='font-bold text-slate-900 dark:text-white text-sm'>
                      {compactINR(project.spent)}
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50'>
                  <div>
                    <p className='text-xs text-slate-500 dark:text-slate-400 mb-1'>
                      Start Date
                    </p>
                    <p className='font-semibold text-slate-900 dark:text-white text-sm'>
                      {project.startDate}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-slate-500 dark:text-slate-400 mb-1'>
                      Due Date
                    </p>
                    <p className='font-semibold text-slate-900 dark:text-white text-sm'>
                      {project.endDate}
                    </p>
                  </div>
                </div>

                <Button
                  variant='primary'
                  className='w-full mt-4 group-hover:shadow-glow'>
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
