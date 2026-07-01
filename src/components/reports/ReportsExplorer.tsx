"use client";

import { useMemo, useState } from "react";
import { communityReports, type CommunityReport } from "@/data/communityReports";
import { ReportDetailPanel } from "./ReportDetailPanel";
import { ReportList } from "./ReportList";
import { ReportsFilters, type ReportFilters } from "./ReportsFilters";
import { ReportsSummary } from "./ReportsSummary";

const initialFilters: ReportFilters = {
  search: "",
  category: "",
  status: "",
  urgency: ""
};

function matchesSearch(report: CommunityReport, search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return [
    report.id,
    report.title,
    report.category,
    report.community,
    report.locationDetail,
    report.description,
    report.responsibleServiceArea,
    report.status,
    report.urgency
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedSearch);
}

export function ReportsExplorer() {
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [selectedReportId, setSelectedReportId] = useState(communityReports[0]?.id ?? "");

  const categories = useMemo(
    () => Array.from(new Set(communityReports.map((report) => report.category))).sort(),
    []
  );

  const filteredReports = useMemo(
    () =>
      communityReports.filter((report) => {
        const categoryMatch = filters.category ? report.category === filters.category : true;
        const statusMatch = filters.status ? report.status === filters.status : true;
        const urgencyMatch = filters.urgency ? report.urgency === filters.urgency : true;

        return categoryMatch && statusMatch && urgencyMatch && matchesSearch(report, filters.search);
      }),
    [filters]
  );

  const selectedReport = filteredReports.find((report) => report.id === selectedReportId) ?? filteredReports[0] ?? null;

  return (
    <div className="grid gap-8">
      <ReportsSummary reports={communityReports} />
      <ReportsFilters filters={filters} categories={categories} onChange={setFilters} onClear={() => setFilters(initialFilters)} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)] lg:items-start">
        <div className="grid gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-xl font-bold text-ink">Community report register</h2>
            <p className="text-sm font-semibold text-slate-600">
              Showing {filteredReports.length} of {communityReports.length} reports
            </p>
          </div>
          <ReportList reports={filteredReports} selectedReport={selectedReport} onSelectReport={(report) => setSelectedReportId(report.id)} />
        </div>
        <ReportDetailPanel report={selectedReport} />
      </div>
    </div>
  );
}
