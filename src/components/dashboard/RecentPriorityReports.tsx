import { AlertTriangle, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { UrgencyBadge } from "@/components/reports/UrgencyBadge";
import { AnalyticsSection } from "./AnalyticsPrimitives";
import type { DashboardInsights } from "./dashboardInsights";

export function RecentPriorityReports({ insights }: { insights: DashboardInsights }) {
  return (
    <AnalyticsSection
      title="Recent priority reports"
      description="Newer reports that are urgent, need review, or include a danger signal."
    >
      <div className="grid gap-4">
        {insights.recentPriorityReports.map((report) => (
          <article key={report.id} className="rounded-lg bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic-700">{report.category}</p>
                <h3 className="mt-2 text-base font-bold text-ink">{report.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <UrgencyBadge urgency={report.urgency} />
                <StatusBadge status={report.status} />
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
              <p className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-civic-700" aria-hidden="true" />
                <span>
                  <span className="font-bold text-ink">{report.community}</span> · {report.locationDetail}
                </span>
              </p>
              <p>{report.responsibleServiceArea}</p>
              {report.isDangerous ? (
                <p className="inline-flex w-fit items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  Danger noted
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </AnalyticsSection>
  );
}

