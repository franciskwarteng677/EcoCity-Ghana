import { AnalyticsSection, ProgressList } from "./AnalyticsPrimitives";
import type { DashboardInsights } from "./dashboardInsights";
import { getReportStatusLabel } from "@/data/communityReports";

export function StatusOverview({ insights }: { insights: DashboardInsights }) {
  const hasAssignedReports = insights.assignedReports > 0;
  const hasResolvedReports = insights.resolvedReports > 0;

  return (
    <AnalyticsSection
      title="Report status overview"
      description="Current movement of reports through logged, review, open, and resolved states."
    >
      <ProgressList items={insights.statusOverview.map((item) => ({ ...item, label: getReportStatusLabel(item.label) }))} barClassName="bg-civic-600" />
      {!hasAssignedReports ? (
        <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
          No reports have been assigned yet. Assigned work will appear here after review teams route reports to service areas.
        </p>
      ) : null}
      {!hasResolvedReports ? (
        <p className="mt-3 rounded-md bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
          No reports have been resolved yet. Resolution counts will update when service teams close reports.
        </p>
      ) : null}
    </AnalyticsSection>
  );
}
