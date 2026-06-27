import { HardHat } from "lucide-react";

export function EmptyState({ title }: { title: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <div>
        <HardHat className="mx-auto text-secondary" />
        <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</p>
      </div>
    </div>
  );
}
