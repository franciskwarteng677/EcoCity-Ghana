import { PageShell } from "@/components/PageShell";

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="A civic technology platform for healthier Ghanaian communities"
      description="EcoCity Ghana is a civic technology and smart community reporting platform designed to help Ghanaian communities report, organize, and track local issues before they become wider public risks."
    >
      <div className="grid max-w-4xl gap-5">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm leading-7 text-slate-700">
            The platform is being built to support practical reporting around flooding, blocked drains, illegal dumping, sanitation concerns, unsafe roads, broken streetlights, public infrastructure issues, and community safety risks. Its product structure is organized around clear civic categories, accessible reporting pathways, and community-facing views that can support local awareness and response.
          </p>
        </div>

        <div className="rounded-lg border border-civic-100 bg-civic-50 p-6">
          <h2 className="text-lg font-bold text-ink">Why drainage and flooding matter</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Repeated flooding, blocked drains, poor sanitation, and weak local reporting systems can turn everyday maintenance issues into serious community risks. EcoCity Ghana positions these concerns as civic information problems that can be reported earlier, organized clearly, and reviewed by the communities and service stakeholders responsible for response.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-ink">Upcoming platform direction</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Upcoming platform capabilities include Flood & Drainage Watch, verified community reports, map-based issue views, response dashboards, and low-bandwidth reporting options.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
