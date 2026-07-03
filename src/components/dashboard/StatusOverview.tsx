import { AnalyticsSection, ProgressList } from "./AnalyticsPrimitives";
import type { DashboardInsights } from "./dashboardInsights";

export function StatusOverview({ insights }: { insights: DashboardInsights }) {
  return (
    <AnalyticsSection
      title="Report status overview"
      description="Current movement of reports through logged, review, open, and resolved states."
    >
      <ProgressList items={insights.statusOverview} barClassName="bg-civic-600" />
    </AnalyticsSection>
  );
}

