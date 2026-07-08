export interface TrendChartEntry {
  date: string;
  count: number;
}

function formatDayLabel(dateStr: string) {
  const [, month, day] = dateStr.split('-');
  return `${month}/${day}`;
}

export function TrendChart({ entries }: { entries: TrendChartEntry[] }) {
  const max = Math.max(1, ...entries.map((e) => e.count));

  return (
    <div>
      <div className="flex h-32 items-end gap-0.5">
        {entries.map((entry, index) => (
          <div
            key={entry.date}
            className="group relative flex h-full flex-1 items-end"
            title={`${entry.date}: ${entry.count}`}
          >
            <div
              className="w-full rounded-t bg-primary transition-opacity group-hover:opacity-80"
              style={{ height: `${(entry.count / max) * 100}%`, minHeight: entry.count > 0 ? 2 : 0 }}
            />
            {index % 5 === 0 && (
              <span className="absolute left-0 top-full mt-1 text-[10px] text-muted">
                {formatDayLabel(entry.date)}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}
