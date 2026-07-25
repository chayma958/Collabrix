import { Link } from 'react-router-dom';
import type { ComponentType, SVGProps } from 'react';
import { ArrowRightIcon } from '@/components/ui/icons';

export function FeatureNavCard({
  to,
  icon: Icon,
  title,
  description,
  metric,
}: {
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  metric?: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start gap-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-border/50 text-muted transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="mt-0.5 text-xs text-muted">{description}</p>
          {metric && <p className="mt-2 text-xs font-medium text-muted/70">{metric}</p>}
        </div>
      </div>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
    </Link>
  );
}
