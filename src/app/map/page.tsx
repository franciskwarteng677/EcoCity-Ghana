import { MapPinned } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export default function MapPage() {
  return (
    <PageShell
      eyebrow="Map"
      title="Visualize community issues by location"
      description="The map module is prepared for location-based reporting across flood-prone points, blocked drains, waste hotspots, unsafe roads, and public infrastructure concerns."
    >
      <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-civic-500 bg-white p-8 text-center">
        <div>
          <MapPinned className="mx-auto h-12 w-12 text-civic-700" aria-hidden="true" />
          <p className="mt-4 text-lg font-bold text-ink">Location-based issue view</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Map layers are being prepared to organize community reports by area, category, and risk priority.</p>
        </div>
      </div>
    </PageShell>
  );
}
