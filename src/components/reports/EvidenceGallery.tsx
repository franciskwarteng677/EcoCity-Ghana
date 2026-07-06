import type { CommunityReport } from "@/data/communityReports";
import { formatEvidenceFileSize, getReportEvidenceImages } from "@/lib/evidence";

type EvidenceGalleryProps = {
  report: CommunityReport;
  compact?: boolean;
};

export function EvidenceGallery({ report, compact = false }: EvidenceGalleryProps) {
  const evidenceImages = getReportEvidenceImages(report);

  if (evidenceImages.length === 0) {
    return (
      <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
        No evidence image attached.
        {report.evidenceLabel ? (
          <>
            <br />
            <span>Evidence note: {report.evidenceLabel}</span>
          </>
        ) : null}
      </p>
    );
  }

  const gridClassName = evidenceImages.length === 1 ? "mt-5 grid gap-3" : "mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3";
  const imageClassName =
    compact || evidenceImages.length > 1 ? "aspect-[4/3] w-full object-contain" : "max-h-[560px] w-full object-contain";

  return (
    <div className={gridClassName}>
      {evidenceImages.map((evidence, index) => (
        <figure key={evidence.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {evidence.publicUrl ? (
            <img src={evidence.publicUrl} alt={`Evidence image ${index + 1} for ${report.title}`} className={imageClassName} />
          ) : (
            <div className="grid aspect-[4/3] place-items-center p-4 text-center text-sm font-semibold leading-6 text-slate-600">
              Image URL unavailable.
            </div>
          )}
          <figcaption className="border-t border-slate-200 bg-white p-4">
            <p className="break-all text-sm font-bold text-ink">{evidence.fileName || `Evidence image ${index + 1}`}</p>
            {typeof evidence.fileSize === "number" ? (
              <p className="mt-1 text-sm font-semibold text-slate-600">{formatEvidenceFileSize(evidence.fileSize)}</p>
            ) : null}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
