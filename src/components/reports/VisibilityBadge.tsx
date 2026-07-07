import { getReportVisibilityLabel, type ReportVisibility } from "@/data/communityReports";

const visibilityStyles: Record<ReportVisibility, string> = {
  under_review: "bg-amber-50 text-amber-800",
  public: "bg-canopy-100 text-canopy-800",
  hidden: "bg-slate-100 text-slate-700",
  rejected: "bg-red-50 text-red-700"
};

export function VisibilityBadge({ visibility }: { visibility: ReportVisibility }) {
  return (
    <span className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-bold ${visibilityStyles[visibility]}`}>
      {getReportVisibilityLabel(visibility)}
    </span>
  );
}
