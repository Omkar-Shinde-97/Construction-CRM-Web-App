import { useMemo, useState } from 'react';
import { ArrowDownUp, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '../ui/Button';

interface TableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, any>[];
  pageSize?: number;
}

export function TanStackDataTable<T extends object>({
  data,
  columns,
  pageSize = 5,
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: Math.max(1, Math.ceil(data.length / pageSize)),
  });

  return (
    <div className='space-y-4'>
      <div className='overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950'>
        <table className='w-full min-w-[700px] text-left text-sm'>
          <thead className='bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className='px-4 py-4'>
                    {header.isPlaceholder ? null : (
                      <button
                        className='inline-flex items-center gap-2 font-semibold'
                        onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <ArrowDownUp size={12} />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className='hover:bg-slate-50 dark:hover:bg-slate-800/40'>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className='px-4 py-3 text-slate-700 dark:text-slate-200'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='flex items-center justify-between text-sm text-slate-500'>
        <span>
          Page {pageIndex + 1} of{' '}
          {Math.max(1, Math.ceil(data.length / pageSize))}
        </span>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            className='h-9 px-3'
            onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0}
            aria-label='Previous page'>
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant='outline'
            className='h-9 px-3'
            onClick={() =>
              setPageIndex(
                Math.min(Math.ceil(data.length / pageSize) - 1, pageIndex + 1),
              )
            }
            disabled={pageIndex >= Math.ceil(data.length / pageSize) - 1}
            aria-label='Next page'>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
