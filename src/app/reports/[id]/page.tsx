import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Camera, MapPin, ShieldAlert, Wrench } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { EvidenceGallery } from "@/components/reports/EvidenceGallery";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { UrgencyBadge } from "@/components/reports/UrgencyBadge";
import { fetchCommunityReportById } from "@/lib/reports";
import { getReportStatusLabel } from "@/data/communityReports";
import { getEvidenceAttachmentLabel, getReportEvidenceImageCount } from "@/lib/evidence";

type ReportDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function DetailItem({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
      <p className="text-sm leading-6 text-slate-700">
        <span className="font-bold text-ink">{label}</span>
        <br />
        {value}
      </p>
    </div>
  );
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params;
  const result = await fetchCommunityReportById(id);

  if (!result) {
    notFound();
  }

  const { report, updates, source } = result;
  const evidenceImageCount = getReportEvidenceImageCount(report);

  return (
    <PageShell eyebrow="Report Detail" title={report.title} description="Review the full public record for this community report and its civic response timeline.">
      <div className="grid gap-6">
        {source === "sample" ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
            Supabase environment variables are not configured, so this detail page is showing a local starter report.
          </div>
        ) : null}

        <Link href="/reports" className="w-fit text-sm font-bold text-civic-700 hover:text-civic-900">
          Back to community reports
        </Link>

        <section className="rounded-lg border border-civic-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic-700">{report.id}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-normal text-ink">{report.title}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge status={report.status} />
                <UrgencyBadge urgency={report.urgency} />
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{report.category}</span>
              </div>
            </div>
            <span className="rounded-md bg-civic-50 px-3 py-2 text-sm font-bold text-civic-700">{report.responsibleServiceArea}</span>
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-700">{report.description}</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Report facts">
          <DetailItem icon={MapPin} label="Community" value={report.community} />
          <DetailItem icon={MapPin} label="Location detail" value={report.locationDetail || "Approximate location only"} />
          <DetailItem icon={Wrench} label="Responsible service area" value={report.responsibleServiceArea || "Not assigned yet"} />
          <DetailItem icon={ShieldAlert} label="Danger signal" value={report.isDangerous ? "Danger noted" : "No danger signal noted"} />
          <DetailItem icon={Camera} label="Evidence" value={getEvidenceAttachmentLabel(report)} />
          <DetailItem icon={CalendarDays} label="Date submitted" value={formatDate(report.dateReported)} />
        </section>

        <section className="rounded-lg border border-civic-100 bg-white p-5 shadow-sm" aria-labelledby="evidence-heading">
          <div>
            <h2 id="evidence-heading" className="text-xl font-bold tracking-normal text-ink">
              Evidence
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {evidenceImageCount > 0 ? getEvidenceAttachmentLabel(report) : "No evidence image attached."}
            </p>
          </div>

          <EvidenceGallery report={report} />
        </section>

        <section className="rounded-lg border border-civic-100 bg-white p-5 shadow-sm" aria-labelledby="public-updates-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="public-updates-heading" className="text-xl font-bold tracking-normal text-ink">
                Public update timeline
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Visible updates from the civic review workflow.</p>
            </div>
            <p className="text-sm font-bold text-civic-700">
              {updates.length} {updates.length === 1 ? "update" : "updates"}
            </p>
          </div>

          {updates.length === 0 ? (
            <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
              No public updates have been posted yet. Once reviewers publish a status note, it will appear here.
            </p>
          ) : (
            <ol className="mt-5 grid gap-4">
              {updates.map((update) => (
                <li key={update.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-ink">{getReportStatusLabel(update.status)}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{update.note || "Status updated without a public note."}</p>
                    </div>
                    <time className="text-sm font-semibold text-slate-500" dateTime={update.createdAt}>
                      {formatDate(update.createdAt)}
                    </time>
                  </div>
                  {update.responsibleServiceArea ? <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-civic-700">{update.responsibleServiceArea}</p> : null}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </PageShell>
  );
}
