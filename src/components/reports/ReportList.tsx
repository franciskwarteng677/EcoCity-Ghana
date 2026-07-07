import type { CommunityReport } from "@/data/communityReports";
import { ReportCard } from "./ReportCard";

type ReportListProps = {
  reports: CommunityReport[];
  selectedReport: CommunityReport | null;
  hasActiveFilters: boolean;
  onSelectReport: (report: CommunityReport) => void;
};

export function ReportList({ reports, selectedReport, hasActiveFilters, onSelectReport }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-ink">{hasActiveFilters ? "No reports match the current filters" : "No public reports available"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {hasActiveFilters
            ? "Adjust the search, category, status, or urgency filters to review more community reports."
            : "Submitted reports will appear here when they are awaiting review or approved for public visibility."}
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Community report list" className="grid gap-4">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} isSelected={selectedReport?.id === report.id} onSelect={onSelectReport} />
      ))}
    </section>
  );
}
