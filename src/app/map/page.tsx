import { PageShell } from "@/components/PageShell";
import { CommunityMap } from "@/components/map/CommunityMap";

export default function MapPage() {
  return (
    <PageShell
      eyebrow="Map"
      title="Visualize community reports by location"
      description="Explore reported flooding, drainage, sanitation, road safety, public lighting, infrastructure, and community safety concerns across Greater Accra."
    >
      <CommunityMap />
    </PageShell>
  );
}
