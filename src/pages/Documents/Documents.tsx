import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/shared/EmptyState';

const types = ['All', 'Drawings', 'Contracts', 'Reports', 'Photos'] as const;

export function Documents() {
  const documents = useDataStore((state) => state.documents);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [type, setType] = useState<(typeof types)[number]>('All');

  const filtered = useMemo(
    () =>
      documents.filter((item) => {
        const matchesQuery =
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.projectId.toLowerCase().includes(query.toLowerCase());
        const matchesType = type === 'All' || item.type === type;
        return matchesQuery && matchesType;
      }),
    [documents, query, type],
  );

  return (
    <div className='space-y-6'>
      <Card className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-secondary'>
            Library
          </p>
          <h2 className='text-2xl font-extrabold dark:text-white'>Documents</h2>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <label className='relative block min-w-[260px] sm:w-auto'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search documents'
              className='h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
            />
          </label>
          <select
            className='h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
            value={type}
            onChange={(event) =>
              setType(event.target.value as (typeof types)[number])
            }>
            {types.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Button variant='secondary'>Upload File</Button>
        </div>
      </Card>
      {filtered.length === 0 ? (
        <EmptyState title='No documents match your search' />
      ) : view === 'grid' ? (
        <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
          {filtered.map((doc) => (
            <Card key={doc.id} className='space-y-4'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <p className='text-sm font-semibold text-slate-900 dark:text-white'>
                    {doc.name}
                  </p>
                  <p className='text-sm text-slate-500 dark:text-slate-400'>
                    {doc.type}
                  </p>
                </div>
                <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
                  {doc.size}
                </span>
              </div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Uploaded {doc.uploadedAt}
              </p>
              <div className='flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300'>
                {doc.projectId}
              </div>
              <Button variant='outline' className='w-full'>
                Download
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] text-left text-sm'>
              <thead className='bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400'>
                <tr>
                  <th className='px-4 py-3'>Name</th>
                  <th className='px-4 py-3'>Project</th>
                  <th className='px-4 py-3'>Type</th>
                  <th className='px-4 py-3'>Size</th>
                  <th className='px-4 py-3'>Uploaded</th>
                  <th className='px-4 py-3'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
                {filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className='hover:bg-slate-50 dark:hover:bg-slate-800/40'>
                    <td className='px-4 py-3 font-semibold dark:text-white'>
                      {doc.name}
                    </td>
                    <td className='px-4 py-3'>{doc.projectId}</td>
                    <td className='px-4 py-3'>{doc.type}</td>
                    <td className='px-4 py-3'>{doc.size}</td>
                    <td className='px-4 py-3'>{doc.uploadedAt}</td>
                    <td className='px-4 py-3'>
                      <Button variant='outline' className='h-9'>
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <div className='flex items-center justify-end gap-2'>
        <Button
          variant={view === 'grid' ? 'secondary' : 'outline'}
          onClick={() => setView('grid')}>
          Grid
        </Button>
        <Button
          variant={view === 'list' ? 'secondary' : 'outline'}
          onClick={() => setView('list')}>
          List
        </Button>
      </div>
    </div>
  );
}
