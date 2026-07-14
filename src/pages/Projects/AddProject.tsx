import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDataStore } from '../../store/dataStore';
import { useToastStore } from '../../store/toastStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft } from 'lucide-react';
import { Employee } from '../../types';
import { mapApiEmployee } from '../Employees/EmployeesList';
import { TOKEN } from '../../api/apiClient';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name is required'),
  clientName: z.string().min(3, 'Client name is required'),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  category: z.string().min(1, 'Choose a category'),
  location: z.string().min(3, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  totalBudget: z.number().min(1000),
  contractValue: z.number().optional(),
  completionPercentage: z.number().min(0).max(100).default(0),
  status: z.string(),
  managerId: z.string().min(1),
  teamIds: z.array(z.string()).min(1),
  description: z.string().min(10),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function AddProject() {
  const EMPLOYEES_API_URL = 'http://localhost:8080/api/employees';

  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeeError, setEmployeeError] = useState('');
  const pushToast = useToastStore((state) => state.pushToast);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      category: '',
      location: '',
      startDate: '',
      endDate: '',
      totalBudget: 0,
      contractValue: 0,
      completionPercentage: 0,
      status: 'PLANNING',
      managerId: employees[0]?.id ?? '',
      teamIds: [],
      description: '',
    },
  });

  const managerOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label: employee.name,
      })),
    [employees],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadEmployees() {
      try {
        setLoadingEmployees(true);

        const response = await fetch(EMPLOYEES_API_URL, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load employees (${response.status})`);
        }

        const result = (await response.json()) as EmployeesApiResponse;

        if (!result.success) {
          throw new Error(result.message);
        }

        setEmployees(result.data.content.map(mapApiEmployee));
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setEmployeeError(
          err instanceof Error ? err.message : 'Failed to load employees',
        );
      } finally {
        setLoadingEmployees(false);
      }
    }

    loadEmployees();

    return () => controller.abort();
  }, []);

  const handleSave = async (values: ProjectFormValues) => {
    try {
      const payload = {
        name: values.name,
        clientName: values.clientName,
        clientEmail: values.clientEmail || null,
        clientPhone: values.clientPhone || null,
        category: values.category,
        status: values.status,
        location: values.location,
        description: values.description,
        startDate: values.startDate,
        endDate: values.endDate,
        totalBudget: values.totalBudget,
        contractValue: values.contractValue || 0,
        completionPercentage: values.completionPercentage || 0,
        projectManagerId: values.managerId,
        teamMemberIds: Array.from(
          new Set([...values.teamIds, values.managerId]),
        ),
      };

      const response = await fetch('http://localhost:8080/api/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const project = await response.json();

      pushToast({
        title: 'Project Created',
        description: `${payload.name} created successfully`,
        variant: 'success',
      });

      navigate(`/projects`);
    } catch (error) {
      console.error(error);

      pushToast({
        title: 'Failed',
        description:
          error instanceof Error ? error.message : 'Unable to create project',
        variant: 'error',
      });
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold dark:text-white'>
            Add New Project
          </h1>
          <p className='mt-1 text-slate-500 dark:text-slate-400'>
            Create a new construction project with all required details and
            assign a manager and team.
          </p>
        </div>
        <Button variant='outline' onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} /> Back to projects
        </Button>
      </div>

      <Card>
        <form className='grid gap-6' onSubmit={form.handleSubmit(handleSave)}>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='space-y-2 text-sm text-slate-700 dark:text-slate-200'>
              <span>Project Name</span>
              <input
                {...form.register('name')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
                placeholder='e.g. Oceanview Residences'
              />
              <span className='text-xs text-red-500'>
                {form.formState.errors.name?.message}
              </span>
            </label>
            <label className='space-y-2 text-sm text-slate-700 dark:text-slate-200'>
              <span>Client Name</span>
              <input
                {...form.register('clientName')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
                placeholder='e.g. Coastal Developers'
              />
              <span className='text-xs text-red-500'>
                {form.formState.errors.clientName?.message}
              </span>
            </label>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            <label className='space-y-2 text-sm text-slate-700 dark:text-slate-200'>
              <span>Category</span>
              <select
                {...form.register('category')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'>
                <option value=''>Select Category</option>
                <option value='RESIDENTIAL'>Residential</option>
                <option value='COMMERCIAL'>Commercial</option>
                <option value='INDUSTRIAL'>Industrial</option>
                <option value='INFRASTRUCTURE'>Infrastructure</option>
                <option value='RENOVATION'>Renovation</option>
                <option value='INTERIOR'>Interior</option>
              </select>
              <span className='text-xs text-red-500'>
                {form.formState.errors.category?.message}
              </span>
            </label>
            <label className='space-y-2 text-sm text-slate-700 dark:text-slate-200'>
              <span>Location</span>
              <input
                {...form.register('location')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
                placeholder='City or site location'
              />
              <span className='text-xs text-red-500'>
                {form.formState.errors.location?.message}
              </span>
            </label>
            <label className='space-y-2 text-sm text-slate-700 dark:text-slate-200'>
              <span>Status</span>
              <select
                {...form.register('status')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'>
                <option value='PLANNING'>Planning</option>
                <option value='IN_PROGRESS'>In Progress</option>
                <option value='ON_HOLD'>On Hold</option>
                <option value='COMPLETED'>Completed</option>
                <option value='WON'>Won</option>
                <option value='LOST'>Lost</option>
              </select>
              <span className='text-xs text-red-500'>
                {form.formState.errors.status?.message}
              </span>
            </label>
          </div>

          <div className='grid gap-4 md:grid-cols-4'>
            <label className='space-y-2 text-sm text-slate-700 dark:text-slate-200'>
              <span>Start Date</span>
              <input
                type='date'
                {...form.register('startDate')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
              />
              <span className='text-xs text-red-500'>
                {form.formState.errors.startDate?.message}
              </span>
            </label>
            <label className='space-y-2 text-sm text-slate-700 dark:text-slate-200'>
              <span>End Date</span>
              <input
                type='date'
                {...form.register('endDate')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
              />
              <span className='text-xs text-red-500'>
                {form.formState.errors.endDate?.message}
              </span>
            </label>
            <label className='space-y-2 text-sm text-slate-700 dark:text-slate-200'>
              <span>Budget</span>
              <input
                type='number'
                {...form.register('totalBudget', { valueAsNumber: true })}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
                placeholder='₹'
              />
              <span className='text-xs text-red-500'>
                {form.formState.errors.totalBudget?.message}
              </span>
            </label>
            <label className='space-y-2 text-sm text-slate-700 dark:text-slate-200'>
              <span>Project Manager</span>
              <select
                {...form.register('managerId')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'>
                {managerOptions.map((manager) => (
                  <option key={manager.value} value={manager.value}>
                    {manager.label}
                  </option>
                ))}
              </select>
              <span className='text-xs text-red-500'>
                {form.formState.errors.managerId?.message}
              </span>
            </label>
          </div>

          <Card className='bg-slate-50 dark:bg-slate-900'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-bold dark:text-white'>
                  Assign Team
                </h2>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  Select the employees who will be working on this project.
                </p>
              </div>
              <Badge label='Required' />
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              {employees.map((employee) => (
                <label
                  key={employee.id}
                  className='flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm transition hover:border-secondary hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-secondary dark:hover:bg-slate-900'>
                  <input
                    type='checkbox'
                    value={employee.id}
                    {...form.register('teamIds')}
                    className='h-4 w-4 accent-secondary'
                  />
                  <span>{employee.name}</span>
                </label>
              ))}
            </div>
            <span className='mt-3 block text-xs text-red-500'>
              {form.formState.errors.teamIds?.message}
            </span>
          </Card>

          <label className='space-y-2 text-sm text-slate-700 dark:text-slate-200'>
            <span>Description</span>
            <textarea
              {...form.register('description')}
              rows={5}
              className='w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
              placeholder='Write a short description of the project.'
            />
            <span className='text-xs text-red-500'>
              {form.formState.errors.description?.message}
            </span>
          </label>

          <div className='flex flex-wrap gap-3'>
            <Button type='submit'>Create Project</Button>
            <Button
              variant='outline'
              type='button'
              onClick={() => navigate('/projects')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
