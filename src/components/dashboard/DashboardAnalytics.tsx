import { CategoryBreakdown } from "./CategoryBreakdown";
import { CommunityHotspots } from "./CommunityHotspots";
import { DashboardSummaryCards } from "./DashboardSummaryCards";
import { FloodDrainageWatch } from "./FloodDrainageWatch";
import { RecentPriorityReports } from "./RecentPriorityReports";
import { ServiceAreaSummary } from "./ServiceAreaSummary";
import { StatusOverview } from "./StatusOverview";
import { UrgencyBreakdown } from "./UrgencyBreakdown";
import { getDashboardInsights } from "./dashboardInsights";

export function DashboardAnalytics() {
  const insights = getDashboardInsights();

  return (
    <div className="grid gap-6">
      <DashboardSummaryCards insights={insights} />
      <div className="grid gap-6 xl:grid-cols-2">
        <StatusOverview insights={insights} />
        <UrgencyBreakdown insights={insights} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <CategoryBreakdown insights={insights} />
        <CommunityHotspots insights={insights} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <FloodDrainageWatch insights={insights} />
        <ServiceAreaSummary insights={insights} />
      </div>
      <RecentPriorityReports insights={insights} />
    </div>
  );
}

