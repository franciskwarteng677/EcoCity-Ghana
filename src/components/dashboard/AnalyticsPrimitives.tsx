import type { CountItem } from "./dashboardInsights";

type AnalyticsSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AnalyticsSection({ title, description, children }: AnalyticsSectionProps) {
  return (
    <section className="rounded-lg border border-civic-100 bg-white p-5 shadow-sm" aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}>
      <div className="mb-5">
        <h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`} className="text-xl font-bold tracking-normal text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function ProgressList<T extends CountItem>({
  items,
  barClassName = "bg-civic-600",
  emptyLabel = "No reports available"
}: {
  items: T[];
  barClassName?: string;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="rounded-md bg-slate-50 p-4 text-sm font-semibold text-slate-600">{emptyLabel}</p>;
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div key={item.label} className="grid gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-bold text-ink">{item.label}</p>
            <p className="shrink-0 text-sm font-semibold text-slate-600">
              {item.count} {item.count === 1 ? "report" : "reports"} · {item.percentage}%
            </p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${Math.max(item.percentage, item.count > 0 ? 8 : 0)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

