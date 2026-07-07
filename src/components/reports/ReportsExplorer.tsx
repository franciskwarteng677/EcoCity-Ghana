"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getReportStatusLabel, reportCategories, type CommunityReport } from "@/data/communityReports";
import { useCommunityReports } from "@/hooks/useCommunityReports";
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
    getReportStatusLabel(report.status),
    report.urgency
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedSearch);
}

export function ReportsExplorer() {
  const { reports, source, isLoading, error } = useCommunityReports();
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [selectedReportId, setSelectedReportId] = useState("");

  const categories = useMemo(() => {
    const reportCategorySet = new Set(reports.map((report) => report.category));
    const categoriesForFilters = reportCategorySet.size > 0 ? Array.from(reportCategorySet) : reportCategories;

    return [...categoriesForFilters].sort();
  }, [reports]);

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const categoryMatch = filters.category ? report.category === filters.category : true;
        const statusMatch = filters.status ? report.status === filters.status : true;
        const urgencyMatch = filters.urgency ? report.urgency === filters.urgency : true;

        return categoryMatch && statusMatch && urgencyMatch && matchesSearch(report, filters.search);
      }),
    [filters, reports]
  );

  const selectedReport = filteredReports.find((report) => report.id === selectedReportId) ?? filteredReports[0] ?? null;
  const hasActiveFilters = Boolean(filters.search || filters.category || filters.status || filters.urgency);

  useEffect(() => {
    if (!selectedReport && filteredReports[0]) {
      setSelectedReportId(filteredReports[0].id);
    }
  }, [filteredReports, selectedReport]);

  if (isLoading) {
    return (
      <div className="grid min-h-[260px] place-items-center rounded-lg border border-civic-100 bg-white p-8 text-center shadow-sm">
        <div>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-civic-700" aria-hidden="true" />
          <p className="mt-4 text-sm font-bold text-ink">Loading community reports</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Fetching the latest report register.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800" role="alert">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold">Unable to load community reports</h2>
            <p className="mt-2 text-sm leading-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {source === "sample" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
          Supabase environment variables are not configured, so local starter reports are shown.
        </div>
      ) : null}
      <ReportsSummary reports={reports} />
      <ReportsFilters filters={filters} categories={categories} onChange={setFilters} onClear={() => setFilters(initialFilters)} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)] lg:items-start">
        <div className="grid gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-xl font-bold text-ink">Community report register</h2>
            <p className="text-sm font-semibold text-slate-600">
              Showing {filteredReports.length} of {reports.length} reports
            </p>
          </div>
          <ReportList
            reports={filteredReports}
            selectedReport={selectedReport}
            hasActiveFilters={hasActiveFilters}
            onSelectReport={(report) => setSelectedReportId(report.id)}
          />
        </div>
        <ReportDetailPanel report={selectedReport} />
      </div>
    </div>
  );
}
