import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, HeartPulse, Star } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Avatar } from '../../components/shared/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';
import { formatINR } from '../../utils/formatters';

export function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employee = useDataStore((state) =>
    state.employees.find((item) => item.id === id),
  );
  const projects = useDataStore((state) => state.projects);

  if (!employee) {
    return (
      <div className='rounded-3xl bg-white p-8 shadow-soft dark:bg-slate-950'>
        Employee not found.
      </div>
    );
  }

  const assignedProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.managerId === employee.id ||
          project.teamIds.includes(employee.id),
      ),
    [projects, employee.id],
  );

  return (
    <div className='space-y-6'>
      <Card className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            className='h-11 w-11 p-0'
            onClick={() => navigate(-1)}
            aria-label='Back'>
            <ArrowLeft size={18} />
          </Button>
          <div className='flex items-center gap-4'>
            <Avatar label={employee.avatar} size='lg' />
            <div>
              <h2 className='text-2xl font-extrabold dark:text-white'>
                {employee.name}
              </h2>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                {employee.role} · {employee.department}
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-wrap gap-3'>
          <Badge label={employee.status} />
          <Button variant='secondary'>Message</Button>
        </div>
      </Card>

      <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
        <div className='space-y-6'>
          <Card>
            <h3 className='mb-4 text-lg font-bold dark:text-white'>
              Personal Information
            </h3>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <p className='text-sm text-slate-500'>Employee ID</p>
                <p className='font-semibold dark:text-white'>
                  {employee.employeeId}
                </p>
              </div>
              <div>
                <p className='text-sm text-slate-500'>Date of Birth</p>
                <p className='font-semibold dark:text-white'>{employee.dob}</p>
              </div>
              <div>
                <p className='text-sm text-slate-500'>Phone</p>
                <p className='font-semibold dark:text-white'>
                  {employee.phone}
                </p>
              </div>
              <div>
                <p className='text-sm text-slate-500'>Email</p>
                <p className='font-semibold dark:text-white'>
                  {employee.email}
                </p>
              </div>
              <div className='md:col-span-2'>
                <p className='text-sm text-slate-500'>Address</p>
                <p className='font-semibold dark:text-white'>
                  {employee.address}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <h3 className='mb-4 text-lg font-bold dark:text-white'>
              Professional Info
            </h3>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <p className='text-sm text-slate-500'>Join Date</p>
                <p className='font-semibold dark:text-white'>
                  {employee.joinDate}
                </p>
              </div>
              <div>
                <p className='text-sm text-slate-500'>Salary</p>
                <p className='font-semibold dark:text-white'>
                  {formatINR(employee.salary)}
                </p>
              </div>
              <div>
                <p className='text-sm text-slate-500'>Active Projects</p>
                <p className='font-semibold dark:text-white'>
                  {employee.activeProjects}
                </p>
              </div>
              <div>
                <p className='text-sm text-slate-500'>Completed Projects</p>
                <p className='font-semibold dark:text-white'>
                  {employee.projectsCompleted}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className='flex items-center gap-3'>
              <HeartPulse className='text-secondary' />
              <h3 className='text-lg font-bold dark:text-white'>Performance</h3>
            </div>
            <div className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300'>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={
                    index < Math.round(employee.rating)
                      ? 'text-secondary'
                      : 'text-slate-300'
                  }
                />
              ))}
              <span className='font-semibold text-slate-900 dark:text-white'>
                {employee.rating.toFixed(1)} / 5
              </span>
            </div>
            <p className='mt-3 text-slate-600 dark:text-slate-300'>
              A reliable team member with strong communication, field
              coordination, and planning skills.
            </p>
          </Card>
        </div>
        <div className='space-y-6'>
          <Card>
            <h3 className='mb-4 text-lg font-bold dark:text-white'>
              Assigned Projects
            </h3>
            {assignedProjects.length === 0 ? (
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                No current projects assigned.
              </p>
            ) : (
              <ul className='space-y-3'>
                {assignedProjects.map((project) => (
                  <li
                    key={project.id}
                    className='rounded-3xl border border-slate-200 p-4 dark:border-slate-800'>
                    <p className='font-semibold dark:text-white'>
                      {project.name}
                    </p>
                    <p className='text-sm text-slate-500'>
                      {project.client} · {project.status}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <h3 className='mb-4 text-lg font-bold dark:text-white'>
              Attendance Summary
            </h3>
            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='rounded-3xl bg-slate-50 p-4 text-center dark:bg-slate-900'>
                <p className='text-sm text-slate-500'>Present</p>
                <p className='mt-2 text-2xl font-semibold dark:text-white'>
                  18
                </p>
              </div>
              <div className='rounded-3xl bg-slate-50 p-4 text-center dark:bg-slate-900'>
                <p className='text-sm text-slate-500'>Absent</p>
                <p className='mt-2 text-2xl font-semibold dark:text-white'>2</p>
              </div>
              <div className='rounded-3xl bg-slate-50 p-4 text-center dark:bg-slate-900'>
                <p className='text-sm text-slate-500'>Leave</p>
                <p className='mt-2 text-2xl font-semibold dark:text-white'>1</p>
              </div>
            </div>
          </Card>
          <Card>
            <h3 className='mb-4 text-lg font-bold dark:text-white'>
              Documents
            </h3>
            <div className='space-y-3 text-sm text-slate-500 dark:text-slate-300'>
              <p>
                <span className='font-semibold text-slate-900 dark:text-white'>
                  ID Proof:
                </span>{' '}
                Uploaded
              </p>
              <p>
                <span className='font-semibold text-slate-900 dark:text-white'>
                  Contract:
                </span>{' '}
                Uploaded
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
