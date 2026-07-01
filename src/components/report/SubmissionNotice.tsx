import { ShieldCheck } from "lucide-react";

export function SubmissionNotice() {
  return (
    <div className="rounded-lg border border-civic-100 bg-civic-50 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-civic-700 text-white">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-bold text-ink">Report prepared for review</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Your report has been prepared on this page. Official submission, verification, and routing to responsible service teams will be enabled in a later platform release.
          </p>
        </div>
      </div>
    </div>
  );
}
