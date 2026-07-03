import { AlertTriangle, Camera, MapPin, UserRound } from "lucide-react";
import type { ReportFormData } from "./ReportForm";

type ReportPreviewCardProps = {
  report: ReportFormData | null;
};

function previewValue(value: string, fallback = "Not provided") {
  return value.trim() ? value : fallback;
}

export function ReportPreviewCard({ report }: ReportPreviewCardProps) {
  if (!report) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-ink">Report preview</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Complete the report fields to review the category, location, urgency, and contact preference before submission.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4" aria-live="polite">
      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-civic-700">{report.category}</p>
            <h2 className="mt-2 text-xl font-bold text-ink">{report.title}</h2>
          </div>
          <span className="w-fit rounded-md bg-civic-50 px-3 py-2 text-sm font-bold text-civic-700">{report.urgency}</span>
        </div>

        <div className="mt-5 grid gap-4 text-sm text-slate-700">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
            <p>
              <span className="font-bold text-ink">{report.community}</span>
              <br />
              {previewValue(report.location)}
              {report.latitude && report.longitude ? (
                <>
                  <br />
                  <span className="text-slate-600">
                    Coordinates: {report.latitude}, {report.longitude}
                  </span>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
            <p>{report.isDangerous ? "This issue is currently dangerous." : "No immediate danger was indicated."}</p>
          </div>
          <p className="leading-6">{report.description}</p>
          <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <Camera className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
              <p>
                <span className="font-bold text-ink">Evidence</span>
                <br />
                {report.evidenceName || "No file selected"}
              </p>
            </div>
            <div className="flex gap-3">
              <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
              <p>
                <span className="font-bold text-ink">Contact preference</span>
                <br />
                {report.contactPreference}
                {report.reporterName ? `, ${report.reporterName}` : ""}
                {report.contactDetail ? `, ${report.contactDetail}` : ""}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
