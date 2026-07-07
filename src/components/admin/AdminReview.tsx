"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Pencil, RefreshCw, Save, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import {
  getReportStatusLabel,
  getReportVisibilityLabel,
  normalizeReportStatus,
  normalizeReportVisibility,
  reportCategories,
  reportStatuses,
  reportVisibilities,
  reportUrgencies,
  type CommunityReport,
  type ReportCategory,
  type ReportStatus,
  type ReportVisibility,
  type ReportUpdate,
  type ReportUrgency
} from "@/data/communityReports";
import type { ReportDataSource } from "@/lib/reports";
import { EvidenceGallery } from "@/components/reports/EvidenceGallery";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { UrgencyBadge } from "@/components/reports/UrgencyBadge";
import { VisibilityBadge } from "@/components/reports/VisibilityBadge";
import { getEvidenceAttachmentLabel, getReportEvidenceImageCount } from "@/lib/evidence";

type AdminFilters = {
  status: string;
  visibility: string;
  urgency: string;
  category: string;
  danger: string;
};

type AdminApiResponse = {
  error?: string;
  reports?: CommunityReport[];
  source?: ReportDataSource;
  updates?: ReportUpdate[];
  report?: {
    status?: string;
    public_visibility?: string | null;
    service_area?: string | null;
    contact_preference?: string | null;
    reporter_name?: string | null;
    reporter_contact?: string | null;
  } | null;
};

type ReporterContactDetails = {
  contactPreference: string | null;
  reporterName: string | null;
  reporterContact: string | null;
};

const initialFilters: AdminFilters = {
  status: "",
  visibility: "",
  urgency: "",
  category: "",
  danger: ""
};

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-ink shadow-sm outline-none focus:border-civic-700 focus:ring-2 focus:ring-civic-100";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function normalizeOptionalText(value?: string | null) {
  const trimmedValue = value?.trim();

  return trimmedValue || null;
}

function getReporterContactDetails(report: AdminApiResponse["report"]): ReporterContactDetails | null {
  if (!report) {
    return null;
  }

  return {
    contactPreference: normalizeOptionalText(report.contact_preference),
    reporterName: normalizeOptionalText(report.reporter_name),
    reporterContact: normalizeOptionalText(report.reporter_contact)
  };
}

function getContactPreferenceDisplay(contactPreference: string | null) {
  if (!contactPreference || contactPreference === "No contact needed") {
    return "Reporter did not request contact.";
  }

  return contactPreference;
}

function matchesFilters(report: CommunityReport, filters: AdminFilters) {
  const statusMatch = filters.status ? report.status === filters.status : true;
  const visibilityMatch = filters.visibility ? report.publicVisibility === filters.visibility : true;
  const urgencyMatch = filters.urgency ? report.urgency === filters.urgency : true;
  const categoryMatch = filters.category ? report.category === filters.category : true;
  const dangerMatch = filters.danger ? report.isDangerous === (filters.danger === "yes") : true;

  return statusMatch && visibilityMatch && urgencyMatch && categoryMatch && dangerMatch;
}

async function sendAdminRequest(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = (await response.json()) as AdminApiResponse;

  if (!response.ok) {
    throw new Error(result.error ?? "Unable to complete the admin review action.");
  }

  return result;
}

function FeedbackBanner({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  const toneClass =
    tone === "success" ? "border-canopy-100 bg-canopy-100 text-canopy-800" : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-md border p-3 text-sm font-semibold leading-6 ${toneClass}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}

function ContactDetailRow({ label, value, emptyText }: { label: string; value: string | null; emptyText: string }) {
  return (
    <div className="rounded-md bg-white p-3">
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-ink">{value || "Not provided"}</dd>
      {!value ? <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{emptyText}</p> : null}
    </div>
  );
}

function ReporterContactSection({
  details,
  isLoading,
  error
}: {
  details: ReporterContactDetails | null;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <section className="mt-4 rounded-lg border border-civic-100 bg-civic-50 p-4" aria-labelledby="reporter-contact-heading">
      <div className="flex items-start gap-3">
        <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
        <div>
          <h4 id="reporter-contact-heading" className="text-sm font-bold text-ink">
            Reporter contact details
          </h4>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">Private to admin review. Do not publish these details in public updates.</p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold leading-6 text-red-700">{error}</p>
      ) : isLoading && !details ? (
        <p className="mt-4 rounded-md bg-white p-3 text-sm font-semibold leading-6 text-slate-600">Loading reporter contact details...</p>
      ) : details ? (
        <dl className="mt-4 grid gap-3">
          <div className="rounded-md bg-white p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Contact preference</dt>
            <dd className="mt-1 text-sm font-bold text-ink">{getContactPreferenceDisplay(details.contactPreference)}</dd>
          </div>
          <ContactDetailRow label="Reporter name" value={details.reporterName} emptyText="No reporter name provided." />
          <ContactDetailRow label="Phone/email" value={details.reporterContact} emptyText="No phone or email provided." />
        </dl>
      ) : (
        <p className="mt-4 rounded-md bg-white p-3 text-sm font-semibold leading-6 text-slate-600">
          Reporter contact details are not available for this report.
        </p>
      )}
    </section>
  );
}

export function AdminReview() {
  const [localReports, setLocalReports] = useState<CommunityReport[]>([]);
  const [source, setSource] = useState<ReportDataSource>("supabase");
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminFilters>(initialFilters);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [status, setStatus] = useState<ReportStatus>("needs_review");
  const [publicVisibility, setPublicVisibility] = useState<ReportVisibility>("under_review");
  const [responsibleServiceArea, setResponsibleServiceArea] = useState("");
  const [note, setNote] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [reviewUpdates, setReviewUpdates] = useState<ReportUpdate[]>([]);
  const [hasLoadedUpdates, setHasLoadedUpdates] = useState(false);
  const [updatesError, setUpdatesError] = useState<string | null>(null);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const [reporterContactDetails, setReporterContactDetails] = useState<ReporterContactDetails | null>(null);
  const [reporterContactError, setReporterContactError] = useState<string | null>(null);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadAdminReports = useCallback(async () => {
    setIsLoadingReports(true);
    setReportsError(null);

    try {
      const result = await sendAdminRequest({
        action: "list_reports"
      });

      setLocalReports(result.reports ?? []);
      setSource(result.source ?? "supabase");
    } catch (error) {
      setLocalReports([]);
      setReportsError(error instanceof Error ? error.message : "Unable to load submitted reports.");
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    void loadAdminReports();
  }, [loadAdminReports]);

  const filteredReports = useMemo(() => localReports.filter((report) => matchesFilters(report, filters)), [filters, localReports]);
  const selectedReport = filteredReports.find((report) => report.id === selectedReportId) ?? filteredReports[0] ?? null;
  const activeReportId = selectedReport?.id ?? "";

  const loadReviewUpdates = useCallback(
    async (reportId: string, showErrors = true) => {
      setIsLoadingUpdates(true);
      setUpdatesError(null);
      setReporterContactError(null);

      try {
        const result = await sendAdminRequest({
          action: "list_updates",
          reportId
        });

        setReviewUpdates(result.updates ?? []);
        setReporterContactDetails(getReporterContactDetails(result.report));
        setHasLoadedUpdates(true);
      } catch (error) {
        setReviewUpdates([]);
        setReporterContactDetails(null);
        setHasLoadedUpdates(false);

        if (showErrors) {
          const message = error instanceof Error ? error.message : "Unable to load review history.";
          setUpdatesError(message);
          setReporterContactError(message);
        }
      } finally {
        setIsLoadingUpdates(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!activeReportId || !selectedReport) {
      setReviewUpdates([]);
      setHasLoadedUpdates(false);
      return;
    }

    setStatus(selectedReport.status);
    setPublicVisibility(selectedReport.publicVisibility);
    setResponsibleServiceArea(selectedReport.responsibleServiceArea);
    setNote("");
    setIsPublic(true);
    setEditingUpdateId(null);
    setReporterContactDetails(null);
    setReporterContactError(null);
    setSaveError(null);
    setSaveMessage(null);
  }, [activeReportId]);

  useEffect(() => {
    if (!activeReportId) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadReviewUpdates(activeReportId, false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [activeReportId, loadReviewUpdates]);

  function updateSelectedReport(nextStatus: ReportStatus, nextServiceArea?: string | null, nextPublicVisibility?: ReportVisibility | null) {
    if (!selectedReport) {
      return;
    }

    setLocalReports((current) =>
      current.map((report) =>
        report.id === selectedReport.id
          ? {
              ...report,
              status: nextStatus,
              publicVisibility: nextPublicVisibility ?? report.publicVisibility,
              responsibleServiceArea: nextServiceArea?.trim() || report.responsibleServiceArea
            }
          : report
      )
    );
  }

  function updateSelectedReportFromApi(report: AdminApiResponse["report"]) {
    if (!report?.status) {
      return;
    }

    const refreshedStatus = normalizeReportStatus(report.status);
    const refreshedVisibility = normalizeReportVisibility(report.public_visibility);

    updateSelectedReport(refreshedStatus, report.service_area, refreshedVisibility);
    setStatus(refreshedStatus);
    setPublicVisibility(refreshedVisibility);

    if (report.service_area) {
      setResponsibleServiceArea(report.service_area);
    }
  }

  function cancelEdit() {
    if (!selectedReport) {
      return;
    }

    setEditingUpdateId(null);
    setStatus(selectedReport.status);
    setPublicVisibility(selectedReport.publicVisibility);
    setResponsibleServiceArea(selectedReport.responsibleServiceArea);
    setNote("");
    setIsPublic(true);
    setSaveError(null);
    setSaveMessage(null);
  }

  function startEdit(update: ReportUpdate) {
    setEditingUpdateId(update.id);
    setStatus(update.status);
    setPublicVisibility(selectedReport?.publicVisibility ?? "under_review");
    setResponsibleServiceArea(update.responsibleServiceArea ?? "");
    setNote(update.note ?? "");
    setIsPublic(update.isPublic);
    setSaveError(null);
    setSaveMessage(null);
  }

  function handleStatusChange(nextStatus: ReportStatus) {
    setStatus(nextStatus);

    if (nextStatus === "rejected") {
      setPublicVisibility("rejected");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedReport || isSaving) {
      return;
    }

    const isEditingLatestUpdate = editingUpdateId ? reviewUpdates[0]?.id === editingUpdateId : true;

    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const result = await sendAdminRequest({
        action: editingUpdateId ? "update_update" : "create_update",
        reportId: selectedReport.id,
        updateId: editingUpdateId ?? undefined,
        status,
        publicVisibility,
        responsibleServiceArea,
        note,
        isPublic
      });

      setReviewUpdates(result.updates ?? []);
      setHasLoadedUpdates(true);

      if (result.report) {
        updateSelectedReportFromApi(result.report);
        setReporterContactDetails(getReporterContactDetails(result.report));
      } else if (!editingUpdateId || isEditingLatestUpdate) {
        updateSelectedReport(status, responsibleServiceArea, publicVisibility);
      }

      setSaveMessage(
        editingUpdateId
          ? "Review update saved and report status refreshed."
          : isPublic
            ? "Review update saved successfully. The public timeline has been updated."
            : "Review update saved successfully. This note is stored for admin review and is not shown publicly."
      );
      setEditingUpdateId(null);
      setNote("");
      setIsPublic(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save this review update.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteUpdate(update: ReportUpdate) {
    if (!selectedReport || deletingUpdateId) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this review update? If this is the latest update, the report status will be refreshed from the remaining review history."
    );

    if (!confirmed) {
      return;
    }

    setDeletingUpdateId(update.id);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const result = await sendAdminRequest({
        action: "delete_update",
        reportId: selectedReport.id,
        updateId: update.id
      });

      setReviewUpdates(result.updates ?? []);
      setHasLoadedUpdates(true);
      updateSelectedReportFromApi(result.report);
      setReporterContactDetails(getReporterContactDetails(result.report));

      if (editingUpdateId === update.id) {
        cancelEdit();
      }

      setSaveMessage("Review update deleted. Report status has been refreshed.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Please try again.";
      setSaveError(`The review update could not be deleted. ${detail}`);
    } finally {
      setDeletingUpdateId(null);
    }
  }

  if (isLoadingReports) {
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

  if (reportsError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800" role="alert">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold">Unable to load admin reports</h2>
            <p className="mt-2 text-sm leading-6">{reportsError}</p>
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
            Public visibility
            <select value={filters.visibility} onChange={(event) => setFilters({ ...filters, visibility: event.target.value })} className={inputClass}>
              <option value="">All visibility</option>
              {reportVisibilities.map((option) => (
                <option key={option} value={option}>
                  {getReportVisibilityLabel(option)}
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] xl:items-start">
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
                      <VisibilityBadge visibility={report.publicVisibility} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">{report.responsibleServiceArea}</span>
                    <span className={report.isDangerous ? "rounded-md bg-red-50 px-2.5 py-1 text-red-700" : "rounded-md bg-slate-100 px-2.5 py-1 text-slate-700"}>
                      {report.isDangerous ? "Danger noted" : "No danger signal"}
                    </span>
                    {getReportEvidenceImageCount(report) > 0 ? (
                      <span className="rounded-md bg-canopy-100 px-2.5 py-1 text-canopy-800">{getEvidenceAttachmentLabel(report)}</span>
                    ) : null}
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">{formatDate(report.dateReported)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="grid gap-5 xl:sticky xl:top-28">
          <section className="rounded-lg border border-civic-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-bold tracking-normal text-ink">Review action</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Update status, control public visibility, route the report, and publish a public timeline note.</p>
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={selectedReport.status} />
                    <VisibilityBadge visibility={selectedReport.publicVisibility} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selectedReport.description}</p>
                  <EvidenceGallery report={selectedReport} compact />
                  <ReporterContactSection
                    details={reporterContactDetails}
                    isLoading={isLoadingUpdates}
                    error={reporterContactError}
                  />
                </div>

                <label className="grid gap-2 text-sm font-bold text-ink">
                  Status
                  <select value={status} onChange={(event) => handleStatusChange(event.target.value as ReportStatus)} className={inputClass}>
                    {reportStatuses.map((option) => (
                      <option key={option} value={option}>
                        {getReportStatusLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-bold text-ink">
                  Public visibility
                  <select value={publicVisibility} onChange={(event) => setPublicVisibility(event.target.value as ReportVisibility)} className={inputClass}>
                    {reportVisibilities.map((option) => (
                      <option key={option} value={option}>
                        {getReportVisibilityLabel(option)}
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

                <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(event) => setIsPublic(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-civic-700 focus:ring-civic-700"
                  />
                  <span>
                    <span className="block font-bold text-ink">Show this note on the public timeline</span>
                    <span className="block text-slate-600">Private notes remain visible only in the admin review history.</span>
                  </span>
                </label>

                {saveError ? <FeedbackBanner tone="error">{saveError}</FeedbackBanner> : null}
                {saveMessage ? <FeedbackBanner tone="success">{saveMessage}</FeedbackBanner> : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-civic-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-civic-900 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                    {isSaving ? (editingUpdateId ? "Saving changes..." : "Saving review update...") : editingUpdateId ? "Save changes" : "Save review update"}
                  </button>

                  {editingUpdateId ? (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-civic-300 hover:text-civic-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </form>
            )}
          </section>

          <section className="rounded-lg border border-civic-100 bg-white p-5 shadow-sm" aria-labelledby="review-history-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="review-history-heading" className="text-xl font-bold tracking-normal text-ink">
                  Existing review updates
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Review notes already saved for the selected report.</p>
              </div>
              <button
                type="button"
                onClick={() => selectedReport && void loadReviewUpdates(selectedReport.id)}
                disabled={!selectedReport || isLoadingUpdates}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-civic-100 bg-white px-3 text-sm font-bold text-civic-700 shadow-sm transition hover:bg-civic-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingUpdates ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
                {isLoadingUpdates ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {!selectedReport ? (
              <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
                Select a report to view its review history.
              </p>
            ) : updatesError ? (
              <div className="mt-5">
                <FeedbackBanner tone="error">{updatesError}</FeedbackBanner>
              </div>
            ) : isLoadingUpdates && !hasLoadedUpdates ? (
              <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
                Loading review history...
              </div>
            ) : hasLoadedUpdates && reviewUpdates.length === 0 ? (
              <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
                No review updates have been added for this report yet.
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {reviewUpdates.map((update) => (
                  <article key={update.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-ink">{getReportStatusLabel(update.status)}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-civic-700">
                          {update.responsibleServiceArea || "No service area recorded"}
                        </p>
                      </div>
                      <span className={update.isPublic ? "rounded-md bg-civic-50 px-2.5 py-1 text-xs font-bold text-civic-700" : "rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"}>
                        {update.isPublic ? "Public" : "Private"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">{update.note || "No public update note recorded."}</p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{formatDate(update.createdAt)}</p>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => startEdit(update)}
                        disabled={isSaving || deletingUpdateId === update.id}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-civic-100 bg-white px-3 text-sm font-bold text-civic-700 shadow-sm transition hover:bg-civic-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteUpdate(update)}
                        disabled={isSaving || Boolean(deletingUpdateId)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingUpdateId === update.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                        {deletingUpdateId === update.id ? "Removing..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
