import Image from "next/image";
import Link from "next/link";
import { BarChart3, Bell, ClipboardList, Map, RadioTower, Users } from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { FeatureCard } from "@/components/FeatureCard";
import { reportCategories } from "@/data/reportCategories";

const platformFeatures = [
  {
    title: "Community issue reporting",
    description: "Give citizens a clear way to document local problems before they become larger public risks.",
    icon: ClipboardList
  },
  {
    title: "Location-aware tracking",
    description: "Prepare reports to be organized by neighborhood, district, priority, and service category.",
    icon: Map
  },
  {
    title: "Environmental monitoring",
    description: "Create a foundation for flood, sanitation, waste, water quality, and infrastructure signals.",
    icon: RadioTower
  }
];

const upcomingCapabilities = [
  "Verified community reports and moderation workflows",
  "Flood & Drainage Watch for recurring flood points and blocked drains",
  "Interactive map layers for flood, waste, lighting, and safety hotspots",
  "District-level dashboards for service response and trend analysis",
  "Status updates from local authorities and community partners",
  "SMS and low-bandwidth reporting options for wider access"
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <section className="relative isolate min-h-[calc(100svh-73px)] overflow-hidden bg-ink text-white">
        <Image
          src="/images/ecocity-ghana-hero.png"
          alt="A Ghanaian urban community street with improved drainage, greenery, solar streetlights, and citizens using phones"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,32,31,0.92)_0%,rgba(19,32,31,0.72)_42%,rgba(19,32,31,0.22)_100%)]" />
        <div className="relative mx-auto flex min-h-[calc(100svh-73px)] max-w-7xl items-center px-4 py-14 sm:px-5 lg:px-8">
          <div className="max-w-3xl min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-civic-100">Smart cities for local action</p>
            <h1 className="mt-6 text-4xl font-bold tracking-normal sm:text-5xl md:text-6xl lg:text-7xl">EcoCity Ghana</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 md:text-xl">
              A civic technology platform for reporting flooding, waste, sanitation, infrastructure, and community safety issues across Ghanaian communities.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/report" className="rounded-md bg-civic-500 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-civic-600">
                Report an issue
              </Link>
              <Link href="/reports" className="rounded-md border border-white/40 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white backdrop-blur transition hover:bg-white/18">
                View community reports
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-civic-700">What it does</p>
            <h2 className="mt-4 text-3xl font-bold tracking-normal text-ink md:text-4xl">A clearer channel between citizens, communities, and local services.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              EcoCity Ghana is designed to help communities surface everyday problems, organize them into useful categories, and make local environmental risks easier to understand.
            </p>
          </div>
          <div className="mt-10 grid min-w-0 gap-5 md:grid-cols-3">
            {platformFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-civic-700">Report categories</p>
              <h2 className="mt-4 text-3xl font-bold tracking-normal text-ink md:text-4xl">Problems citizens can report</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              These categories organize the main civic and environmental issues EcoCity Ghana is designed to support.
            </p>
          </div>
          <div className="mt-10 grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {reportCategories.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-8">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-civic-700">How it works</p>
            <h2 className="mt-4 text-3xl font-bold tracking-normal text-ink md:text-4xl">Simple enough for citizens. Structured enough for action.</h2>
          </div>
          <div className="grid min-w-0 gap-4">
            {[
              ["1", "A resident identifies a local issue such as flooding, dumping, poor drainage, or a broken streetlight."],
              ["2", "The issue is prepared with a category, location context, description, urgency level, and supporting evidence."],
              ["3", "Reports can be reviewed on community pages, mapped by location, and summarized in dashboards."],
              ["4", "Local stakeholders can use the information to prioritize response, prevention, and maintenance."]
            ].map(([step, text]) => (
              <div key={step} className="flex gap-4 rounded-lg border border-civic-100 bg-civic-50 p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-civic-700 text-sm font-bold text-white">{step}</span>
                <p className="text-sm leading-6 text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-civic-900 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-5 lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.85fr)] lg:px-8">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-civic-100">Why it matters</p>
            <h2 className="mt-4 text-3xl font-bold tracking-normal md:text-4xl">Better local data can improve safety, sanitation, resilience, and trust.</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-civic-100">
              Ghanaian communities face practical environmental and infrastructure issues every day. A shared reporting platform can help turn scattered complaints into organized civic signals.
            </p>
          </div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="min-w-0 rounded-lg bg-white/10 p-5">
              <Users className="h-6 w-6 text-civic-100" aria-hidden="true" />
              <p className="mt-4 font-bold">Community visibility</p>
              <p className="mt-2 text-sm leading-6 text-civic-100">Residents can see what is being reported around them.</p>
            </div>
            <div className="min-w-0 rounded-lg bg-white/10 p-5">
              <Bell className="h-6 w-6 text-civic-100" aria-hidden="true" />
              <p className="mt-4 font-bold">Earlier risk signals</p>
              <p className="mt-2 text-sm leading-6 text-civic-100">Flooding, waste, and safety risks become easier to spot.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-civic-700">Upcoming platform</p>
              <h2 className="mt-4 text-3xl font-bold tracking-normal text-ink md:text-4xl">Built for community reporting, local insight, and coordinated response.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                EcoCity Ghana is structured to grow across reporting, maps, dashboards, and civic workflows as the platform matures.
              </p>
            </div>
            <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-civic-700" aria-hidden="true" />
                <h3 className="text-xl font-bold text-ink">Upcoming capabilities</h3>
              </div>
              <ul className="mt-6 grid gap-4">
                {upcomingCapabilities.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-canopy-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
