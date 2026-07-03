import { AnalyticsSection } from "./AnalyticsPrimitives";
import type { DashboardInsights } from "./dashboardInsights";

export function CommunityHotspots({ insights }: { insights: DashboardInsights }) {
  return (
    <AnalyticsSection
      title="Community hotspots"
      description="Communities with repeated reports, urgent concerns, or danger signals."
    >
      {insights.communityHotspots.length === 0 ? (
        <p className="rounded-md bg-slate-50 p-4 text-sm font-semibold text-slate-600">No community hotspots are available yet.</p>
      ) : null}
      <div className="grid gap-3">
        {insights.communityHotspots.map((community) => (
          <div key={community.label} className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-ink">{community.label}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {community.count} {community.count === 1 ? "report" : "reports"} · {community.percentage}% of register
                </p>
              </div>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-civic-700 shadow-sm">
                {community.urgentCount} urgent
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Danger signals: <span className="font-bold text-ink">{community.dangerCount}</span>
            </p>
          </div>
        ))}
      </div>
    </AnalyticsSection>
  );
}
