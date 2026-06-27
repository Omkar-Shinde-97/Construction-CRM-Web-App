import { useMemo, useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';

const stages = ['Lead', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'] as const;

export function Pipeline() {
  const pipeline = useDataStore((state) => state.pipelineProjects);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const stageGroups = useMemo(
    () =>
      stages.map((stage) => ({
        stage,
        items: pipeline.filter((item) => item.stage === stage),
      })),
    [pipeline],
  );

  const onDrop = (stage: string) => {
    if (!draggedId) return;
    useDataStore.setState((state) => ({
      pipelineProjects: state.pipelineProjects.map((item) =>
        item.id === draggedId
          ? { ...item, stage: stage as (typeof stages)[number] }
          : item,
      ),
    }));
    setDraggedId(null);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-secondary'>
            Pipeline
          </p>
          <h2 className='text-2xl font-extrabold dark:text-white'>
            Upcoming Projects
          </h2>
        </div>
        <div className='flex gap-2'>
          <Button
            variant={view === 'board' ? 'secondary' : 'outline'}
            onClick={() => setView('board')}>
            Board View
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'outline'}
            onClick={() => setView('list')}>
            List View
          </Button>
          <Button variant='secondary'>+ Add Pipeline Project</Button>
        </div>
      </div>

      {view === 'board' ? (
        <div className='grid gap-4 overflow-x-auto md:grid-cols-2 xl:grid-cols-5'>
          {stageGroups.map((group) => (
            <Card key={group.stage} className='min-h-[320px]'>
              <h3 className='mb-4 text-lg font-semibold dark:text-white'>
                {group.stage}
              </h3>
              <div className='space-y-3'>
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className='rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900'
                    draggable
                    onDragStart={() => setDraggedId(item.id)}>
                    <h4 className='font-semibold dark:text-white'>
                      {item.name}
                    </h4>
                    <p className='text-sm text-slate-500 dark:text-slate-400'>
                      {item.client}
                    </p>
                    <div className='mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300'>
                      <span>{item.probability}%</span>
                      <span>Start {item.expectedStart}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onDrop(group.stage)}
                className='mt-4 rounded-3xl border-2 border-dashed border-slate-200 p-3 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400'>
                Drop here to move
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <DataTable
            data={pipeline as unknown as Record<string, unknown>[]}
            searchKeys={['name', 'client', 'assignedTo'] as never[]}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'client', header: 'Client' },
              {
                key: 'stage',
                header: 'Stage',
                render: (row) => <Badge label={String(row.stage)} />,
              },
              {
                key: 'estimatedValue',
                header: 'Value',
                render: (row) =>
                  `₹${Number(row.estimatedValue).toLocaleString('en-IN')}`,
              },
              { key: 'probability', header: 'Probability' },
              { key: 'assignedTo', header: 'Owner' },
              { key: 'nextActionDate', header: 'Next Action Date' },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
