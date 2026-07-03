import { AnalyticsSection, ProgressList } from "./AnalyticsPrimitives";
import type { DashboardInsights } from "./dashboardInsights";

export function CategoryBreakdown({ insights }: { insights: DashboardInsights }) {
  return (
    <AnalyticsSection
      title="Category breakdown"
      description="Issue categories appearing across the community report register."
    >
      <ProgressList items={insights.categoryBreakdown} barClassName="bg-canopy-500" />
    </AnalyticsSection>
  );
}

