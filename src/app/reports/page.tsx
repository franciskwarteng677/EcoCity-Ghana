import { PageShell } from "@/components/PageShell";

const mockReports = [
  ["Odorkor", "Blocked drain causing roadside flooding", "Needs review"],
  ["Kaneshie", "Overflowing public waste container", "Open"],
  ["Teshie", "Streetlight outage near bus stop", "Logged"],
  ["Nima", "Floodwater collecting near a busy footbridge", "Open"],
  ["Madina", "Deep potholes creating unsafe road conditions", "Needs review"]
];

export default function ReportsPage() {
  return (
    <PageShell
      eyebrow="Community Reports"
      title="Track local issues reported by citizens"
      description="Community reports are organized to show issue location, concern type, review status, priority signals, and responsible service areas."
    >
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {mockReports.map(([area, issue, status]) => (
          <div key={issue} className="grid gap-2 border-b border-slate-100 p-5 last:border-b-0 md:grid-cols-[160px_1fr_120px]">
            <p className="font-bold text-ink">{area}</p>
            <p className="text-sm text-slate-600">{issue}</p>
            <p className="text-sm font-semibold text-civic-700">{status}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
