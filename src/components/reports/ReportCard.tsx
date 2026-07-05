import { AlertTriangle, Camera, MapPin } from "lucide-react";
import Link from "next/link";
import type { CommunityReport } from "@/data/communityReports";
import { StatusBadge } from "./StatusBadge";
import { UrgencyBadge } from "./UrgencyBadge";

type ReportCardProps = {
  report: CommunityReport;
  isSelected: boolean;
  onSelect: (report: CommunityReport) => void;
};

export function ReportCard({ report, isSelected, onSelect }: ReportCardProps) {
  const hasCoordinates = typeof report.latitude === "number" && typeof report.longitude === "number";
  const mapLabel = hasCoordinates ? "Mapped" : report.locationDetail ? "Approximate location only" : "Needs map location";
  const hasEvidenceImage = Boolean(report.evidencePublicUrl || report.evidenceFilePath);

  return (
    <article
      className={`w-full rounded-lg border bg-white p-5 text-left shadow-sm transition hover:border-civic-300 ${
        isSelected ? "border-civic-700 ring-2 ring-civic-100" : "border-slate-200"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(report)}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-civic-700 focus:ring-offset-2"
        aria-pressed={isSelected}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic-700">{report.category}</p>
            <h3 className="mt-2 text-base font-bold text-ink">{report.title}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <UrgencyBadge urgency={report.urgency} />
            <StatusBadge status={report.status} />
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-600">
          <p className="flex gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-civic-700" aria-hidden="true" />
            <span>
              <span className="font-bold text-ink">{report.community}</span> - {report.locationDetail}
            </span>
          </p>
          <p>{report.description}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{report.responsibleServiceArea}</span>
            <span className="rounded-md bg-civic-50 px-2.5 py-1 text-xs font-bold text-civic-700">{mapLabel}</span>
            {hasEvidenceImage ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-canopy-100 px-2.5 py-1 text-xs font-bold text-canopy-800">
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                Evidence attached
              </span>
            ) : null}
            {report.isDangerous ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                Danger noted
              </span>
            ) : null}
          </div>
        </div>
      </button>
      <div className="mt-4 border-t border-slate-100 pt-3">
        <Link href={`/reports/${report.id}`} className="text-sm font-bold text-civic-700 hover:text-civic-900">
          View report details
        </Link>
      </div>
    </article>
  );
}
