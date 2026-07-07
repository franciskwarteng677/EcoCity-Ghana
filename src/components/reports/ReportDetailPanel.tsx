import { CalendarDays, Camera, MapPin, ShieldAlert, Wrench } from "lucide-react";
import type { CommunityReport } from "@/data/communityReports";
import { getEvidenceAttachmentLabel } from "@/lib/evidence";
import { StatusBadge } from "./StatusBadge";
import { UrgencyBadge } from "./UrgencyBadge";
import { VisibilityBadge } from "./VisibilityBadge";

type ReportDetailPanelProps = {
  report: CommunityReport | null;
};

export function ReportDetailPanel({ report }: ReportDetailPanelProps) {
  if (!report) {
    return (
      <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Report details</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Select a community report to review its location, urgency, service area, and current status.</p>
      </aside>
    );
  }
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic-700">{report.id}</p>
      <h2 className="mt-2 text-xl font-bold text-ink">{report.title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <UrgencyBadge urgency={report.urgency} />
        <StatusBadge status={report.status} />
        {report.publicVisibility === "under_review" ? <VisibilityBadge visibility={report.publicVisibility} /> : null}
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{report.category}</span>
      </div>

      <div className="mt-6 grid gap-5 text-sm leading-6 text-slate-700">
        <p>{report.description}</p>

        <div className="grid gap-4 border-t border-slate-100 pt-5">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
            <p>
              <span className="font-bold text-ink">Location</span>
              <br />
              {report.community} - {report.locationDetail}
            </p>
          </div>

          <div className="flex gap-3">
            <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
            <p>
              <span className="font-bold text-ink">Responsible service area</span>
              <br />
              {report.responsibleServiceArea}
            </p>
          </div>

          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
            <p>
              <span className="font-bold text-ink">Date reported</span>
              <br />
              {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(report.dateReported))}
            </p>
          </div>

          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
            <p>
              <span className="font-bold text-ink">Safety signal</span>
              <br />
              {report.isDangerous ? "Immediate danger has been noted for this report." : "No immediate danger has been noted for this report."}
            </p>
          </div>

          <div className="flex gap-3">
            <Camera className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
            <p>
              <span className="font-bold text-ink">Evidence</span>
              <br />
              {getEvidenceAttachmentLabel(report)}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
