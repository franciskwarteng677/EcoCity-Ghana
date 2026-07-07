import { AlertTriangle, Camera, CircleCheck, ClipboardList, EyeOff, Flame, Images, MapPinned, ShieldAlert, UserCheck, UsersRound, Wrench, XCircle } from "lucide-react";
import type { DashboardInsights } from "./dashboardInsights";
import { InsightCard } from "./InsightCard";

export function DashboardSummaryCards({ insights }: { insights: DashboardInsights }) {
  const cards = [
    {
      label: "Total submitted",
      value: insights.totalReports,
      detail: "All reports submitted, including those hidden from public pages.",
      icon: ClipboardList
    },
    {
      label: "Awaiting review",
      value: insights.needsReviewReports,
      detail: "Publicly visible submissions that are not verified yet.",
      icon: ShieldAlert,
      tone: "amber" as const
    },
    {
      label: "Verified",
      value: insights.verifiedReports,
      detail: "Reports confirmed as actionable after review.",
      icon: UserCheck
    },
    {
      label: "Assigned",
      value: insights.assignedReports,
      detail: "Reports routed to a responsible service area.",
      icon: Wrench
    },
    {
      label: "In progress",
      value: insights.inProgressReports,
      detail: "Reports with response work underway.",
      icon: MapPinned
    },
    {
      label: "Resolved reports",
      value: insights.resolvedReports,
      detail: "Reports marked as resolved in the current community register.",
      icon: CircleCheck
    },
    {
      label: "Rejected",
      value: insights.rejectedReports,
      detail: "Reports rejected by moderation and excluded from public pages.",
      icon: XCircle,
      tone: "red" as const
    },
    {
      label: "Hidden",
      value: insights.hiddenReports,
      detail: "Reports hidden from public pages while retained for admin review.",
      icon: EyeOff,
      tone: "slate" as const
    },
    {
      label: "Danger signals",
      value: insights.dangerSignals,
      detail: "Reports where direct safety risk is noted by the community.",
      icon: AlertTriangle,
      tone: "red" as const
    },
    {
      label: "Reports with evidence",
      value: insights.reportsWithEvidence,
      detail: "Reports with at least one attached evidence image.",
      icon: Camera
    },
    {
      label: "Evidence images",
      value: insights.totalEvidenceImages,
      detail: "Total evidence images attached across submitted reports.",
      icon: Images
    },
    {
      label: "High/emergency reports",
      value: insights.highEmergencyReports,
      detail: "Reports carrying high or emergency urgency.",
      icon: Flame,
      tone: "red" as const
    },
    {
      label: "Need map location",
      value: insights.reportsNeedingMapLocation,
      detail: "Reports that need coordinates before appearing as map pins.",
      icon: UsersRound,
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
