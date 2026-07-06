import { PageShell } from "@/components/PageShell";
import { AdminAccessGate } from "@/components/admin/AdminAccessGate";
import { hasValidAdminSession } from "@/lib/adminAuth";

export default async function AdminPage() {
  const initialHasAccess = await hasValidAdminSession();

  return (
    <PageShell
      eyebrow="Admin Review"
      title="Review and route submitted reports"
      description="Use the MVP civic response workflow to verify reports, assign service areas, and publish public status updates."
    >
      <AdminAccessGate initialHasAccess={initialHasAccess} />
    </PageShell>
  );
}
