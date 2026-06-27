import { useMemo } from 'react';
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

const projectSchema = z.object({
  name: z.string().min(3, 'Project name is required'),
  client: z.string().min(3, 'Client name is required'),
  category: z.string().min(2, 'Choose a category'),
  location: z.string().min(3, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  budget: z.number().min(1000, 'Budget must be greater than ₹1,000'),
  status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed']),
  managerId: z.string().min(1, 'Assign a manager'),
  teamIds: z.array(z.string()).min(1, 'Select at least one team member'),
  description: z.string().min(10, 'Provide a brief description'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function AddProject() {
  const navigate = useNavigate();
  const employees = useDataStore((state) => state.employees);
  const addProject = useDataStore((state) => state.addProject);
  const pushToast = useToastStore((state) => state.pushToast);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      client: '',
      category: '',
      location: '',
      startDate: '',
      endDate: '',
      budget: 0,
      status: 'Planning',
      managerId: employees[0]?.id ?? '',
      teamIds: employees[0] ? [employees[0].id] : [],
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

  const handleSave = (values: ProjectFormValues) => {
    const newProjectId = `PRJ-${Date.now()}`;
    const teamMembers = Array.from(
      new Set([...values.teamIds, values.managerId]),
    );

    addProject({
      id: newProjectId,
      name: values.name,
      client: values.client,
      category: values.category,
      location: values.location,
      startDate: values.startDate,
      endDate: values.endDate,
      status: values.status,
      budget: values.budget,
      spent: 0,
      completion: 0,
      managerId: values.managerId,
      teamIds: teamMembers,
      description: values.description,
      cover:
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    });

    pushToast({
      title: 'Project created',
      description: `${values.name} has been added to the project pipeline.`,
      variant: 'success',
    });

    navigate(`/projects/${newProjectId}`);
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
                {...form.register('client')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
                placeholder='e.g. Coastal Developers'
              />
              <span className='text-xs text-red-500'>
                {form.formState.errors.client?.message}
              </span>
            </label>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            <label className='space-y-2 text-sm text-slate-700 dark:text-slate-200'>
              <span>Category</span>
              <select
                {...form.register('category')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'>
                <option value=''>Select category</option>
                <option value='Residential'>Residential</option>
                <option value='Commercial'>Commercial</option>
                <option value='Infrastructure'>Infrastructure</option>
                <option value='Retail'>Retail</option>
                <option value='Healthcare'>Healthcare</option>
                <option value='Luxury Villas'>Luxury Villas</option>
                <option value='Institutional'>Institutional</option>
                <option value='Industrial'>Industrial</option>
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
                <option value='Planning'>Planning</option>
                <option value='In Progress'>In Progress</option>
                <option value='On Hold'>On Hold</option>
                <option value='Completed'>Completed</option>
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
                {...form.register('budget', { valueAsNumber: true })}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
                placeholder='₹'
              />
              <span className='text-xs text-red-500'>
                {form.formState.errors.budget?.message}
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
