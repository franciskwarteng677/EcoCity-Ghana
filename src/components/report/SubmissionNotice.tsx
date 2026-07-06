import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export function SubmissionNotice({
  reportId,
  isMapped,
  evidenceImageCount,
  onSubmitAnother
}: {
  reportId?: string;
  isMapped?: boolean;
  evidenceImageCount?: number;
  onSubmitAnother: () => void;
}) {
  const evidenceMessage =
    evidenceImageCount === 1
      ? "1 evidence image was attached."
      : evidenceImageCount && evidenceImageCount > 1
        ? `${evidenceImageCount} evidence images were attached.`
        : "No evidence images were attached.";

  return (
    <div className="rounded-lg border border-civic-100 bg-civic-50 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-civic-700 text-white">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-bold text-ink">Report submitted successfully.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Your report has been saved for community review{reportId ? ` with tracking ID ${reportId}` : ""}.{" "}
            {isMapped
              ? "It includes a map location and can appear as a marker."
              : "It was saved without map coordinates and will appear in the reports register while listed separately on the map page."}
            {" "}
            {evidenceMessage}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {reportId ? (
              <Link
                href={`/reports/${reportId}`}
                className="inline-flex h-10 items-center justify-center rounded-md bg-civic-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-civic-900"
              >
                View report details
              </Link>
            ) : null}
            <Link
              href="/reports"
              className="inline-flex h-10 items-center justify-center rounded-md border border-civic-100 bg-white px-4 text-sm font-bold text-civic-700 shadow-sm transition hover:bg-civic-50"
            >
              View community reports
            </Link>
            <button
              type="button"
              onClick={onSubmitAnother}
              className="inline-flex h-10 items-center justify-center rounded-md border border-civic-100 bg-white px-4 text-sm font-bold text-civic-700 shadow-sm transition hover:bg-civic-50"
            >
              Submit another report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
