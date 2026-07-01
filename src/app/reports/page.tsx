import { PageShell } from "@/components/PageShell";
import { ReportsExplorer } from "@/components/reports/ReportsExplorer";

export default function ReportsPage() {
  return (
    <PageShell
      eyebrow="Community Reports"
      title="Track local issues reported by citizens"
      description="Community reports are organized to show issue location, concern type, review status, priority signals, and responsible service areas."
    >
      <ReportsExplorer />
    </PageShell>
  );
}
