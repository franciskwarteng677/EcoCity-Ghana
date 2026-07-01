import { PageShell } from "@/components/PageShell";
import { ReportForm } from "@/components/report/ReportForm";

export default function ReportPage() {
  return (
    <PageShell
      eyebrow="Report Issue"
      title="Submit a community issue"
      description="Report local issues early so flooding, blocked drains, poor sanitation, unsafe roads, and public infrastructure concerns can be organized clearly for review."
    >
      <ReportForm />
    </PageShell>
  );
}
