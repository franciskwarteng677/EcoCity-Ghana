import { AlertTriangle, CircleCheck, ClipboardList, MapPin } from "lucide-react";
import type { CommunityReport } from "@/data/communityReports";

type ReportsSummaryProps = {
  reports: CommunityReport[];
};

export function ReportsSummary({ reports }: ReportsSummaryProps) {
  const activeReports = reports.filter((report) => !["resolved", "rejected", "duplicate"].includes(report.status)).length;
  const dangerousReports = reports.filter((report) => report.isDangerous).length;
  const communities = new Set(reports.map((report) => report.community)).size;
  const resolvedReports = reports.filter((report) => report.status === "resolved").length;

  const stats = [
    { label: "Active reports", value: activeReports, icon: ClipboardList },
    { label: "Communities", value: communities, icon: MapPin },
    { label: "Danger signals", value: dangerousReports, icon: AlertTriangle },
    { label: "Resolved", value: resolvedReports, icon: CircleCheck }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Icon className="h-5 w-5 text-civic-700" aria-hidden="true" />
          <p className="mt-4 text-3xl font-bold text-ink">{value}</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">{label}</p>
        </div>
      ))}
    </div>
  );
}
