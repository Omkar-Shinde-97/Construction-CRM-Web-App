import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDataStore } from '../../store/dataStore';
import { Avatar } from '../../components/shared/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/shared/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { formatINR } from '../../utils/formatters';
import { Employee } from '../../types';

const employeeSchema = z.object({
  name: z.string().min(3, 'Enter a full name'),
  employeeId: z.string().min(5, 'Employee ID required'),
  role: z.string().min(3, 'Select a role'),
  department: z.string().min(3, 'Select a department'),
  phone: z.string().min(10, 'Phone is required'),
  email: z.string().email('Enter a valid email'),
  address: z.string().min(5, 'Enter an address'),
  dob: z.string().min(1),
  joinDate: z.string().min(1),
  salary: z.number().min(0),
  status: z.enum(['Active', 'Inactive']),
});

const ROLE_OPTIONS = [
  {
    label: 'Super Admin',
    value: 'SUPER_ADMIN',
  },
  {
    label: 'Admin',
    value: 'ADMIN',
  },
  {
    label: 'Project Manager',
    value: 'PROJECT_MANAGER',
  },
  {
    label: 'Sales Manager',
    value: 'SALES_MANAGER',
  },
  {
    label: 'Accountant',
    value: 'ACCOUNTANT',
  },
  {
    label: 'Viewer',
    value: 'VIEWER',
  },
];

const DEPARTMENT_OPTIONS = [
  'Engineering',
  'Architecture',
  'Sales',
  'Finance',
  'Operations',
  'Administration',
  'HR',
];

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface ApiEmployee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone: string | null;
  role: string;
  department: string;
  status: string;
  dateOfBirth: string;
  joinDate: string;
  address: string;
  salary: number;
  avatarUrl: string | null;
  performanceRating: number | null;
  performanceComment: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EmployeesApiResponse {
  success: boolean;
  message: string;
  data: {
    content: ApiEmployee[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
  timestamp: string;
}

const EMPLOYEES_API_URL = 'http://localhost:8080/api/employees';
const token =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJTVVBFUl9BRE1JTiIsImlhdCI6MTc4MjQ4MjA4NywiZXhwIjoxNzgyNTY4NDg3fQ.RbWp8ITKf12gwHBA82mWlC_vNhC2PHUoVrZTsFCgCtw';
const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const mapApiEmployee = (employee: ApiEmployee): Employee => ({
  id: employee.id,
  employeeId: employee.employeeCode,
  name: employee.fullName,
  role: toTitleCase(employee.role),
  department: toTitleCase(employee.department),
  phone: employee.phone,
  email: employee.email,
  address: employee.address,
  dob: employee.dateOfBirth,
  joinDate: employee.joinDate,
  salary: Number(employee.salary),
  status: employee.status === 'ACTIVE' ? 'Active' : 'Inactive',
  avatar: getInitials(employee.fullName),
  activeProjects: 0,
  projectsCompleted: 0,
  rating: employee.performanceRating ?? 0,
});

export function EmployeesList() {
  const employees = useDataStore((state) => state.employees);
  const setEmployees = useDataStore((state) => state.setEmployees);
  const addEmployee = useDataStore((state) => state.addEmployee);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadEmployees() {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(EMPLOYEES_API_URL, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load employees (${response.status})`);
        }

        const result = (await response.json()) as EmployeesApiResponse;

        if (!result.success) {
          throw new Error(result.message || 'Failed to load employees');
        }

        setEmployees(result.data.content.map(mapApiEmployee));
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setError(
          err instanceof Error ? err.message : 'Failed to load employees',
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadEmployees();

    return () => controller.abort();
  }, [setEmployees]);

  const filtered = useMemo(
    () =>
      employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(query.toLowerCase()) ||
          employee.role.toLowerCase().includes(query.toLowerCase()) ||
          employee.department.toLowerCase().includes(query.toLowerCase()),
      ),
    [employees, query],
  );

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      employeeId: '',
      role: '',
      department: '',
      phone: '',
      email: '',
      address: '',
      dob: '',
      joinDate: '',
      salary: 0,
      status: 'Active',
    },
  });

  const onSubmit = async (values: EmployeeFormValues) => {
    console.log('FORM SUBMITTED', values);
    try {
      setIsSaving(true);
      setSaveError('');

      // Check Employee ID uniqueness
      const employeeIdExists = employees.some(
        (emp) =>
          emp.employeeId.toLowerCase() === values.employeeId.toLowerCase(),
      );

      if (employeeIdExists) {
        setSaveError('Employee ID already exists');
        return;
      }

      // Check Email uniqueness
      const emailExists = employees.some(
        (emp) => emp.email.toLowerCase() === values.email.toLowerCase(),
      );

      if (emailExists) {
        setSaveError('Email already exists');
        return;
      }

      const payload = {
        fullName: values.name,
        employeeCode: values.employeeId,
        email: values.email,
        phone: values.phone,
        alternatePhone: null,
        role: values.role.trim().toUpperCase().replace(/\s+/g, '_'),
        department: values.department.trim().toUpperCase().replace(/\s+/g, '_'),
        status: values.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
        dateOfBirth: values.dob,
        joinDate: values.joinDate,
        address: values.address,
        salary: Number(values.salary),
      };

      const response = await fetch(EMPLOYEES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create employee');
      }

      const newEmployee = mapApiEmployee(result.data);

      addEmployee(newEmployee);

      form.reset();
      setIsOpen(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Failed to create employee',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Card className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='space-y-2'>
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-secondary'>
            Team
          </p>
          <h2 className='text-2xl font-extrabold dark:text-white'>Employees</h2>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <label className='relative block w-full min-w-[220px] sm:w-auto'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search employees'
              className='h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-secondary dark:border-slate-700 dark:bg-slate-900 dark:text-white'
            />
          </label>
          <Button variant='secondary' onClick={() => setIsOpen(true)}>
            <Plus size={18} /> Add Employee
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className='h-56 animate-pulse bg-slate-50 dark:bg-slate-900'>
              <div className='h-full rounded-lg bg-slate-100 dark:bg-slate-800' />
            </Card>
          ))}
        </div>
      ) : error ? (
        <EmptyState title={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title='No employees found.' />
      ) : (
        <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {filtered.map((employee) => (
            <Card key={employee.id} className='space-y-4'>
              <div className='flex items-center gap-4'>
                <Avatar label={employee.avatar} />
                <div>
                  <p className='text-lg font-semibold dark:text-white'>
                    {employee.name}
                  </p>
                  <p className='text-sm text-slate-500 dark:text-slate-400'>
                    {employee.role}
                  </p>
                </div>
              </div>
              <div className='space-y-2 text-sm text-slate-600 dark:text-slate-300'>
                <p>
                  <span className='font-semibold text-slate-900 dark:text-white'>
                    ID:
                  </span>{' '}
                  {employee.employeeId}
                </p>
                <p>
                  <span className='font-semibold text-slate-900 dark:text-white'>
                    Department:
                  </span>{' '}
                  {employee.department}
                </p>
                <p>
                  <span className='font-semibold text-slate-900 dark:text-white'>
                    Projects:
                  </span>{' '}
                  {employee.activeProjects}
                </p>
                <p>
                  <span className='font-semibold text-slate-900 dark:text-white'>
                    Salary:
                  </span>{' '}
                  {formatINR(employee.salary)}
                </p>
              </div>
              <div className='flex items-center justify-between gap-3'>
                <Badge label={employee.status} />
                <Button
                  variant='outline'
                  onClick={() => navigate(`/employees/${employee.id}`)}>
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title='Add New Employee'
        size='lg'>
        <form
          className='grid gap-4'
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log('Validation Errors:', errors);
          })}>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
              <span>Name</span>
              <input
                {...form.register('name')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'
              />
              {form.formState.errors.name && (
                <p className='text-xs text-red-500'>
                  {form.formState.errors.name.message}
                </p>
              )}
            </label>
            <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
              <span>Employee ID</span>
              <input
                {...form.register('employeeId')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'
              />
              {form.formState.errors.employeeId && (
                <p className='text-xs text-red-500'>
                  {form.formState.errors.employeeId.message}
                </p>
              )}
            </label>
            <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
              <span>Role</span>
              <select
                {...form.register('role')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950'>
                <option value=''>Select Role</option>

                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              {form.formState.errors.role && (
                <p className='text-xs text-red-500'>
                  {form.formState.errors.role.message}
                </p>
              )}
            </label>
            <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
              <span>Department</span>
              <select
                {...form.register('department')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950'>
                <option value=''>Select Department</option>

                {DEPARTMENT_OPTIONS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>

              {form.formState.errors.department && (
                <p className='text-xs text-red-500'>
                  {form.formState.errors.department.message}
                </p>
              )}
            </label>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
              <span>Phone</span>
              <input
                {...form.register('phone')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'
              />
              {form.formState.errors.phone && (
                <p className='text-xs text-red-500'>
                  {form.formState.errors.phone.message}
                </p>
              )}
            </label>
            <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
              <span>Email</span>
              <input
                {...form.register('email')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'
              />
              {form.formState.errors.address && (
                <p className='text-xs text-red-500'>
                  {form.formState.errors.email?.message}
                </p>
              )}
            </label>
            <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
              <span>Address</span>
              <input
                {...form.register('address')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'
              />
              {form.formState.errors.address && (
                <p className='text-xs text-red-500'>
                  {form.formState.errors.address.message}
                </p>
              )}
            </label>
            <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
              <span>Date of Birth</span>
              <input
                type='date'
                {...form.register('dob')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'
              />
              {form.formState.errors.address && (
                <p className='text-xs text-red-500'>
                  {form.formState.errors.dob?.message}
                </p>
              )}
            </label>
          </div>
          <div className='grid gap-4 md:grid-cols-3'>
            <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
              <span>Join Date</span>
              <input
                type='date'
                {...form.register('joinDate')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'
              />

              {form.formState.errors.address && (
                <p className='text-xs text-red-500'>
                  {form.formState.errors.joinDate?.message}
                </p>
              )}
            </label>
            <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
              <span>Salary</span>
              <input
                type='number'
                {...form.register('salary', { valueAsNumber: true })}
                className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'
              />
              {form.formState.errors.address && (
                <p className='text-xs text-red-500'>
                  {form.formState.errors.salary?.message}
                </p>
              )}
            </label>
            <label className='space-y-1 text-sm text-slate-700 dark:text-slate-200'>
              <span>Status</span>
              <select
                {...form.register('status')}
                className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950'>
                <option value='Active'>Active</option>
                <option value='Inactive'>Inactive</option>
              </select>
            </label>
          </div>
          {saveError && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600'>
              {saveError}
            </div>
          )}

          <div className='flex justify-end gap-3 pt-2'>
            <Button
              variant='outline'
              onClick={() => setIsOpen(false)}
              type='button'>
              Cancel
            </Button>

            <Button type='submit' variant='secondary' disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
