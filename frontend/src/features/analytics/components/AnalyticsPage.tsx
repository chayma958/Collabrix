import { useParams, Link } from 'react-router-dom';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { useWorkspaceRealtime } from '@/features/realtime/useWorkspaceRealtime';
import { BarChart } from './BarChart';
import { TrendChart } from './TrendChart';
import type { TaskPriority } from '@/types/board';

const PRIORITY_COLOR_CLASSES: Record<TaskPriority, string> = {
  LOW: 'bg-priority-low',
  MEDIUM: 'bg-priority-medium',
  HIGH: 'bg-priority-high',
  URGENT: 'bg-priority-urgent',
};

export function AnalyticsPage() {
  const { workspaceId = '' } = useParams();
  useWorkspaceRealtime(workspaceId);
  const { data, isLoading } = useAnalytics(workspaceId);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to={`/workspaces/${workspaceId}`} className="text-sm text-muted hover:underline">
        ← Back to workspace
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-semibold text-text">Analytics</h1>

      {isLoading && <p className="text-muted">Loading…</p>}

      {data && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-medium text-text">Task status</h2>
            {data.statusBreakdown.length === 0 ? (
              <p className="text-sm text-muted">No tasks yet.</p>
            ) : (
              <BarChart
                entries={data.statusBreakdown.map((s) => ({ label: s.name, value: s.count }))}
              />
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-text">Priority</h2>
            <BarChart
              entries={data.priorityBreakdown.map((p) => ({
                label: p.priority,
                value: p.count,
                colorClassName: PRIORITY_COLOR_CLASSES[p.priority],
              }))}
            />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-text">Workload</h2>
            {data.workload.every((w) => w.count === 0) ? (
              <p className="text-sm text-muted">No tasks yet.</p>
            ) : (
              <BarChart
                entries={data.workload.map((w) => ({ label: w.name, value: w.count }))}
              />
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-text">
              Completed in the last 30 days
            </h2>
            <TrendChart entries={data.completionTrend} />
          </section>
        </div>
      )}
    </div>
  );
}
