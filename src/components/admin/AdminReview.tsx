"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Save, ShieldCheck } from "lucide-react";
import {
  getReportStatusLabel,
  reportCategories,
  reportStatuses,
  reportUrgencies,
  type CommunityReport,
  type ReportCategory,
  type ReportStatus,
  type ReportUrgency
} from "@/data/communityReports";
import { useCommunityReports } from "@/hooks/useCommunityReports";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { UrgencyBadge } from "@/components/reports/UrgencyBadge";

type AdminFilters = {
  status: string;
  urgency: string;
  category: string;
  danger: string;
};

const initialFilters: AdminFilters = {
  status: "",
  urgency: "",
  category: "",
  danger: ""
};

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-ink shadow-sm outline-none focus:border-civic-700 focus:ring-2 focus:ring-civic-100";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function matchesFilters(report: CommunityReport, filters: AdminFilters) {
  const statusMatch = filters.status ? report.status === filters.status : true;
  const urgencyMatch = filters.urgency ? report.urgency === filters.urgency : true;
  const categoryMatch = filters.category ? report.category === filters.category : true;
  const dangerMatch = filters.danger ? report.isDangerous === (filters.danger === "yes") : true;

  return statusMatch && urgencyMatch && categoryMatch && dangerMatch;
}

export function AdminReview() {
  const { reports, source, isLoading, error } = useCommunityReports();
  const [localReports, setLocalReports] = useState<CommunityReport[]>([]);
  const [filters, setFilters] = useState<AdminFilters>(initialFilters);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [status, setStatus] = useState<ReportStatus>("needs_review");
  const [responsibleServiceArea, setResponsibleServiceArea] = useState("");
  const [note, setNote] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalReports(reports);
  }, [reports]);

  const filteredReports = useMemo(() => localReports.filter((report) => matchesFilters(report, filters)), [filters, localReports]);
  const selectedReport = filteredReports.find((report) => report.id === selectedReportId) ?? filteredReports[0] ?? null;

  useEffect(() => {
    if (selectedReport) {
      setStatus(selectedReport.status);
      setResponsibleServiceArea(selectedReport.responsibleServiceArea);
      setNote("");
    }
  }, [selectedReport?.id, selectedReport]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedReport) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/admin/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adminCode,
          reportId: selectedReport.id,
          status,
          responsibleServiceArea,
          note,
          isPublic: true
        })
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save admin update.");
      }

      setLocalReports((current) =>
        current.map((report) =>
          report.id === selectedReport.id
            ? {
                ...report,
                status,
                responsibleServiceArea: responsibleServiceArea.trim() || report.responsibleServiceArea
              }
            : report
        )
      );
      setNote("");
      setSaveMessage("Report status and public update were saved.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save admin update.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="grid min-h-[260px] place-items-center rounded-lg border border-civic-100 bg-white p-8 text-center shadow-sm">
        <div>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-civic-700" aria-hidden="true" />
          <p className="mt-4 text-sm font-bold text-ink">Loading submitted reports</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Preparing the review register.</p>
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
            <h2 className="text-base font-bold">Unable to load admin reports</h2>
            <p className="mt-2 text-sm leading-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {source === "sample" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
          Supabase environment variables are not configured, so admin review is showing local starter reports. Saving requires Supabase admin credentials.
        </div>
      ) : null}

      <section className="rounded-lg border border-civic-100 bg-white p-5 shadow-sm" aria-label="Admin filters">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2 text-sm font-bold text-ink">
            Status
            <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className={inputClass}>
              <option value="">All statuses</option>
              {reportStatuses.map((option) => (
                <option key={option} value={option}>
                  {getReportStatusLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Urgency
            <select value={filters.urgency} onChange={(event) => setFilters({ ...filters, urgency: event.target.value as ReportUrgency | "" })} className={inputClass}>
              <option value="">All urgency</option>
              {reportUrgencies.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Category
            <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value as ReportCategory | "" })} className={inputClass}>
              <option value="">All categories</option>
              {reportCategories.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Danger signal
            <select value={filters.danger} onChange={(event) => setFilters({ ...filters, danger: event.target.value })} className={inputClass}>
              <option value="">All reports</option>
              <option value="yes">Danger noted</option>
              <option value="no">No danger signal</option>
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] xl:items-start">
        <section className="rounded-lg border border-civic-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-normal text-ink">Submitted reports</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Showing {filteredReports.length} of {localReports.length} reports.</p>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
              No reports match the current review filters.
            </p>
          ) : (
            <div className="mt-5 grid gap-3">
              {filteredReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => setSelectedReportId(report.id)}
                  className={`rounded-lg border p-4 text-left transition hover:border-civic-300 focus:outline-none focus:ring-2 focus:ring-civic-700 focus:ring-offset-2 ${
                    selectedReport?.id === report.id ? "border-civic-700 ring-2 ring-civic-100" : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic-700">{report.category}</p>
                      <h3 className="mt-2 text-base font-bold text-ink">{report.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        <span className="font-bold text-ink">{report.community}</span> - {report.locationDetail || "No location detail"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <UrgencyBadge urgency={report.urgency} />
                      <StatusBadge status={report.status} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">{report.responsibleServiceArea}</span>
                    <span className={report.isDangerous ? "rounded-md bg-red-50 px-2.5 py-1 text-red-700" : "rounded-md bg-slate-100 px-2.5 py-1 text-slate-700"}>
                      {report.isDangerous ? "Danger noted" : "No danger signal"}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">{formatDate(report.dateReported)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-lg border border-civic-100 bg-white p-5 shadow-sm xl:sticky xl:top-28">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold tracking-normal text-ink">Review action</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Update status, route the report, and publish a public timeline note.</p>
            </div>
          </div>

          {!selectedReport ? (
            <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
              Select a report to update its civic response status.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic-700">{selectedReport.id}</p>
                <h3 className="mt-2 text-base font-bold text-ink">{selectedReport.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{selectedReport.description}</p>
              </div>

              <label className="grid gap-2 text-sm font-bold text-ink">
                Admin review code
                <input value={adminCode} onChange={(event) => setAdminCode(event.target.value)} className={inputClass} type="password" required />
              </label>

              <label className="grid gap-2 text-sm font-bold text-ink">
                Status
                <select value={status} onChange={(event) => setStatus(event.target.value as ReportStatus)} className={inputClass}>
                  {reportStatuses.map((option) => (
                    <option key={option} value={option}>
                      {getReportStatusLabel(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-bold text-ink">
                Responsible service area
                <input value={responsibleServiceArea} onChange={(event) => setResponsibleServiceArea(event.target.value)} className={inputClass} />
              </label>

              <label className="grid gap-2 text-sm font-bold text-ink">
                Public update note
                <textarea value={note} onChange={(event) => setNote(event.target.value)} className={`${inputClass} min-h-28 resize-y font-normal`} placeholder="Example: Drainage team assigned for inspection this week." />
              </label>

              {saveError ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{saveError}</p> : null}
              {saveMessage ? <p className="rounded-md bg-canopy-100 p-3 text-sm font-semibold text-canopy-800">{saveMessage}</p> : null}

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-civic-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-civic-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                {isSaving ? "Saving update" : "Save review update"}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
