import { AnalyticsSection } from "./AnalyticsPrimitives";
import type { DashboardInsights } from "./dashboardInsights";

export function ServiceAreaSummary({ insights }: { insights: DashboardInsights }) {
  return (
    <AnalyticsSection
      title="Responsible service areas"
      description="Service groups connected to the current reports and their priority load."
    >
      <div className="grid gap-3">
        {insights.serviceAreas.map((area) => (
          <div key={area.label} className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-ink">{area.label}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {area.count} {area.count === 1 ? "report" : "reports"} · {area.openCount} unresolved
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{area.urgentCount} urgent</span>
                <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">{area.dangerCount} danger</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AnalyticsSection>
  );
}

