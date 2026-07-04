import { PageShell } from "@/components/PageShell";
import { AdminReview } from "@/components/admin/AdminReview";

export default function AdminPage() {
  return (
    <PageShell
      eyebrow="Admin Review"
      title="Review and route submitted reports"
      description="Use the MVP civic response workflow to verify reports, assign service areas, and publish public status updates."
    >
      <AdminReview />
    </PageShell>
  );
}
