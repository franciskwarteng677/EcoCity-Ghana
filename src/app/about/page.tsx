import { PageShell } from "@/components/PageShell";

export default function AboutPage() {
  const currentCapabilities = [
    "Citizen issue reporting for environmental, infrastructure, and safety concerns",
    "Supabase-backed report persistence for submitted community reports",
    "Community report register with search, category, status, and urgency filters",
    "Optional image evidence uploads for reports when it is safe to collect a photo",
    "Dashboard analytics for report volume, urgency, hotspots, and service areas",
    "Map-based issue visibility when reports include location data",
    "Reports without map location are still saved and shown in reports and dashboard views"
  ];

  const futureDirection = [
    "Verified reports",
    "Local authority response tracking",
    "Community alerts",
    "Low-bandwidth reporting options",
    "Admin review tools"
  ];

  return (
    <PageShell
      eyebrow="About"
      title="A civic technology platform for cleaner, safer, and more responsive Ghanaian communities"
      description="EcoCity Ghana helps residents document local environmental, infrastructure, and safety concerns so community issues can be organized, viewed, and understood more clearly."
    >
      <div className="grid max-w-5xl gap-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-ink">What EcoCity Ghana does</h2>
          <p className="text-sm leading-7 text-slate-700">
            Residents can submit reports about flooding, blocked drains, poor drainage, illegal dumping, sanitation concerns, unsafe roads, broken streetlights, public infrastructure issues, and community safety risks. The platform stores submitted reports and makes them visible through the Community Reports register, Dashboard analytics, and Map views when location data is available.
          </p>
        </div>

        <div className="rounded-lg border border-civic-100 bg-civic-50 p-6">
          <h2 className="text-lg font-bold text-ink">Why drainage and flooding matter</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Repeated flooding, blocked drains, poor sanitation, and weak local reporting systems can turn everyday maintenance issues into serious community risks. EcoCity Ghana positions these concerns as civic information problems that can be reported earlier, organized clearly, and reviewed by the communities and service stakeholders responsible for response.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-ink">Current MVP capabilities</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
              {currentCapabilities.map((capability) => (
                <li key={capability} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-civic-700" aria-hidden="true" />
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-ink">Future development direction</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Future work can expand the platform from public reporting and visibility into stronger review, verification, and response workflows.
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
              {futureDirection.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-canopy-500" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
