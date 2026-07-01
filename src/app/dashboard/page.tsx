import { BarChart3, CircleCheck, Clock, MapPin } from "lucide-react";
import { PageShell } from "@/components/PageShell";

const stats = [
  { label: "Open reports", value: "128", icon: Clock },
  { label: "Resolved issues", value: "42", icon: CircleCheck },
  { label: "Mapped hotspots", value: "16", icon: MapPin },
  { label: "Priority areas", value: "8", icon: BarChart3 }
];

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="Dashboard"
      title="Understand community trends and response priorities"
      description="The dashboard is designed to summarize reports by category, location, urgency, and response status using clear community insight views."
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-5">
              <Icon className="h-6 w-6 text-civic-700" aria-hidden="true" />
              <p className="mt-5 text-3xl font-bold text-ink">{value}</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">{label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-civic-100 bg-civic-50 p-6">
          <h2 className="text-lg font-bold text-ink">Upcoming insights</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Upcoming dashboard views can help teams compare category trends, identify flood-prone areas, understand response priorities, and monitor unresolved community risks.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
