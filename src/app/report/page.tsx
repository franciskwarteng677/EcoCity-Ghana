import { PageShell } from "@/components/PageShell";
import { reportCategories } from "@/data/reportCategories";

export default function ReportPage() {
  return (
    <PageShell
      eyebrow="Report Issue"
      title="Submit a community issue"
      description="This reporting flow is being designed to collect clear, useful details about flooding, waste, drainage, sanitation, infrastructure, and safety concerns."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
        <div className="grid gap-4 md:grid-cols-2">
          {reportCategories.slice(0, 4).map((category) => (
            <div key={category.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="font-bold text-ink">{category.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-civic-100 bg-civic-50 p-6">
          <h2 className="text-lg font-bold text-ink">Reporting details</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            This reporting flow is being designed to collect category, location, description, urgency level, evidence or photos, and contact preference.
          </p>
          <p className="mt-4 text-sm font-semibold text-civic-700">Submissions are not enabled on this public preview.</p>
        </div>
      </div>
    </PageShell>
  );
}
