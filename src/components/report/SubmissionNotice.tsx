import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export function SubmissionNotice({ reportId, isMapped }: { reportId?: string; isMapped?: boolean }) {
  return (
    <div className="rounded-lg border border-civic-100 bg-civic-50 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-civic-700 text-white">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-bold text-ink">Report submitted successfully</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Your report has been saved for community review{reportId ? ` as ${reportId}` : ""}.{" "}
            {isMapped
              ? "It includes a map location and can appear as a marker."
              : "It was saved without map coordinates and will appear in the reports register while listed separately on the map page."}
          </p>
          <Link
            href="/reports"
            className="mt-4 inline-flex rounded-md bg-civic-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-civic-900"
          >
            View community reports
          </Link>
        </div>
      </div>
    </div>
  );
}
