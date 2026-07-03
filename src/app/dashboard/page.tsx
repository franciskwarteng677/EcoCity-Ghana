import { PageShell } from "@/components/PageShell";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="Dashboard"
      title="Understand community trends and response priorities"
      description="Review report volume, urgency, service areas, community hotspots, and flood or drainage signals from the current EcoCity Ghana report register."
    >
      <DashboardAnalytics />
    </PageShell>
  );
}
