import { ReactNode, useMemo, useState } from 'react';
import { ArrowDownUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 5,
  searchKeys = [],
  rowKey = 'id',
  onRowClick,
}: {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchKeys?: (keyof T)[];
  rowKey?: keyof T | string;
  onRowClick?: (row: T) => void;
}) {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const rows = q
      ? data.filter((row) =>
          searchKeys.some((key) =>
            String(row[key] ?? '')
              .toLowerCase()
              .includes(q),
          ),
        )
      : data;
    if (!sortKey) return rows;
    const column = columns.find((col) => String(col.key) === sortKey);
    return [...rows].sort((a, b) => {
      const av = column?.sortValue
        ? column.sortValue(a)
        : String(a[sortKey] ?? '');
      const bv = column?.sortValue
        ? column.sortValue(b)
        : String(b[sortKey] ?? '');
      return direction === 'asc'
        ? String(av).localeCompare(String(bv), undefined, { numeric: true })
        : String(bv).localeCompare(String(av), undefined, { numeric: true });
    });
  }, [columns, data, direction, query, searchKeys, sortKey]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setSortKey(key);
    setDirection(sortKey === key && direction === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div>
      <div className='mb-4'>
        <input
          className='h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-secondary dark:border-slate-700 dark:bg-slate-950'
          placeholder='Search table...'
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
        />
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[760px] text-left text-sm'>
          <thead className='bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/70 dark:text-slate-400'>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className='px-4 py-3'>
                  <button
                    className='inline-flex items-center gap-2 font-bold'
                    onClick={() => toggleSort(String(column.key))}>
                    {column.header}
                    <ArrowDownUp size={13} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
            {pageRows.map((row, index) => {
              const currentKey = String(row[rowKey as keyof T] ?? index);

              return (
                <tr
                  key={currentKey}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${onRowClick ? 'cursor-pointer transition-colors duration-150' : ''}`}
                  onClick={() => onRowClick?.(row)}>
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className='px-4 py-3 text-slate-700 dark:text-slate-200'>
                      {column.render
                        ? column.render(row)
                        : String(row[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className='mt-4 flex items-center justify-between text-sm text-slate-500'>
        <span>
          Page {page + 1} of {pages}
        </span>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            className='h-8 px-2'
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            aria-label='Previous page'>
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant='outline'
            className='h-8 px-2'
            onClick={() => setPage(Math.min(pages - 1, page + 1))}
            disabled={page >= pages - 1}
            aria-label='Next page'>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
