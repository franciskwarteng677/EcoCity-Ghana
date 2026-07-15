"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCommunityReports } from "@/hooks/useCommunityReports";
import {
  fetchPublicDashboardCounts,
  getPublicDashboardCounts,
  type PublicDashboardCounts
} from "@/lib/reports";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { CommunityHotspots } from "./CommunityHotspots";
import { DashboardSummaryCards } from "./DashboardSummaryCards";
import { FloodDrainageWatch } from "./FloodDrainageWatch";
import { RecentPriorityReports } from "./RecentPriorityReports";
import { ServiceAreaSummary } from "./ServiceAreaSummary";
import { StatusOverview } from "./StatusOverview";
import { UrgencyBreakdown } from "./UrgencyBreakdown";
import { getDashboardInsights } from "./dashboardInsights";

export function DashboardAnalytics() {
  const { reports, source, isLoading, error } = useCommunityReports();
  const [publicCounts, setPublicCounts] = useState<PublicDashboardCounts | null>(null);
  const [publicCountsError, setPublicCountsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPublicCounts() {
      try {
        const counts = await fetchPublicDashboardCounts();

        if (!isMounted) {
          return;
        }

        setPublicCounts(counts);
        setPublicCountsError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPublicCounts(null);
        setPublicCountsError(error instanceof Error ? error.message : "Unable to load public dashboard counts.");
      }
    }

    void loadPublicCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid min-h-[260px] place-items-center rounded-lg border border-civic-100 bg-white p-8 text-center shadow-sm">
        <div>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-civic-700" aria-hidden="true" />
          <p className="mt-4 text-sm font-bold text-ink">Loading dashboard insights</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Calculating report trends and service area signals.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800" role="alert">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold">Unable to load dashboard insights</h2>
            <p className="mt-2 text-sm leading-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const insights = getDashboardInsights(reports, publicCounts ?? getPublicDashboardCounts(reports));

  return (
    <div className="grid gap-6">
      {source === "sample" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
          Supabase environment variables are not configured, so dashboard insights use local starter reports.
        </div>
      ) : null}
      {publicCountsError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
          Dashboard totals are using the visible public report register because the summary view could not be loaded: {publicCountsError}
        </div>
      ) : null}
      {reports.length === 0 ? (
        <div className="rounded-lg border border-civic-100 bg-white p-5 text-sm font-semibold leading-6 text-slate-600 shadow-sm">
          No public reports are available for dashboard analysis yet. Reports will appear here when they are awaiting review or approved for public visibility.
        </div>
      ) : null}
      <DashboardSummaryCards insights={insights} />
      <div className="grid gap-6 xl:grid-cols-2">
        <StatusOverview insights={insights} />
        <UrgencyBreakdown insights={insights} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <CategoryBreakdown insights={insights} />
        <CommunityHotspots insights={insights} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <FloodDrainageWatch insights={insights} />
        <ServiceAreaSummary insights={insights} />
      </div>
      <RecentPriorityReports insights={insights} />
    </div>
  );
}
