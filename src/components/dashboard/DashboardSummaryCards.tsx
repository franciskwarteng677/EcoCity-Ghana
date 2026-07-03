import { AlertTriangle, CircleCheck, ClipboardList, Flame, MapPinned, ShieldAlert, UsersRound, Wrench } from "lucide-react";
import type { DashboardInsights } from "./dashboardInsights";
import { InsightCard } from "./InsightCard";

export function DashboardSummaryCards({ insights }: { insights: DashboardInsights }) {
  const cards = [
    {
      label: "Total reports",
      value: insights.totalReports,
      detail: "Community issues currently represented in the report register.",
      icon: ClipboardList
    },
    {
      label: "Open reports",
      value: insights.openReports,
      detail: "Reports still visible as open items for local service attention.",
      icon: MapPinned
    },
    {
      label: "Needs review",
      value: insights.needsReviewReports,
      detail: "Reports that should be assessed before response planning.",
      icon: ShieldAlert,
      tone: "amber" as const
    },
    {
      label: "Resolved reports",
      value: insights.resolvedReports,
      detail: "Reports marked as resolved in the current community register.",
      icon: CircleCheck
    },
    {
      label: "Danger signals",
      value: insights.dangerSignals,
      detail: "Reports where direct safety risk is noted by the community.",
      icon: AlertTriangle,
      tone: "red" as const
    },
    {
      label: "Emergency reports",
      value: insights.emergencyReports,
      detail: "Reports carrying the highest urgency classification.",
      icon: Flame,
      tone: "red" as const
    },
    {
      label: "Communities represented",
      value: insights.communitiesRepresented,
      detail: "Distinct communities appearing across the current reports.",
      icon: UsersRound,
      tone: "slate" as const
    },
    {
      label: "High-priority service areas",
      value: insights.highPriorityServiceAreas,
      detail: "Service areas with urgent reports or danger signals.",
      icon: Wrench,
      tone: "amber" as const
    }
  ];

  return (
    <section aria-labelledby="dashboard-summary-heading">
      <h2 id="dashboard-summary-heading" className="sr-only">
        Dashboard summary
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <InsightCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}

