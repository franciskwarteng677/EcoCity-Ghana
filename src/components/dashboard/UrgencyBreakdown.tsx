import { AnalyticsSection, ProgressList } from "./AnalyticsPrimitives";
import type { DashboardInsights } from "./dashboardInsights";

export function UrgencyBreakdown({ insights }: { insights: DashboardInsights }) {
  return (
    <AnalyticsSection
      title="Urgency breakdown"
      description="Distribution of reports by priority level, including safety-critical signals."
    >
      <ProgressList items={insights.urgencyBreakdown} barClassName="bg-amber-500" />
    </AnalyticsSection>
  );
}

