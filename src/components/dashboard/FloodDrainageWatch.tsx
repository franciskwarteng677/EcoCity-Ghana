import { Droplets } from "lucide-react";
import { AnalyticsSection, ProgressList } from "./AnalyticsPrimitives";
import type { DashboardInsights } from "./dashboardInsights";

export function FloodDrainageWatch({ insights }: { insights: DashboardInsights }) {
  const dangerCount = insights.floodDrainageReports.filter((report) => report.isDangerous).length;
  const urgentCount = insights.floodDrainageReports.filter((report) => report.urgency === "High" || report.urgency === "Emergency").length;

  return (
    <AnalyticsSection
      title="Flood and drainage watch"
      description="Focused view of flooding, drains, poor drainage, and polluted water concerns."
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-civic-50 p-4">
          <Droplets className="h-5 w-5 text-civic-700" aria-hidden="true" />
          <p className="mt-3 text-2xl font-bold text-ink">{insights.floodDrainageReports.length}</p>
          <p className="text-sm font-semibold text-slate-600">Flood and drainage reports</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4">
          <p className="text-2xl font-bold text-ink">{urgentCount}</p>
          <p className="mt-3 text-sm font-semibold text-slate-600">High or emergency urgency</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-2xl font-bold text-ink">{dangerCount}</p>
          <p className="mt-3 text-sm font-semibold text-slate-600">Danger signals noted</p>
        </div>
      </div>
      <ProgressList items={insights.floodDrainageCommunities} barClassName="bg-civic-600" emptyLabel="No flood or drainage reports available." />
    </AnalyticsSection>
  );
}

