export interface BarChartEntry {
  label: string;
  value: number;
  colorClassName?: string;
}

export function BarChart({ entries }: { entries: BarChartEntry[] }) {
  const max = Math.max(1, ...entries.map((e) => e.value));

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm text-text">{entry.label}</span>
          <div className="h-4 flex-1 overflow-hidden rounded bg-surface">
            <div
              className={entry.colorClassName ?? 'bg-primary'}
              style={{ width: `${(entry.value / max) * 100}%`, height: '100%' }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm text-muted">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
