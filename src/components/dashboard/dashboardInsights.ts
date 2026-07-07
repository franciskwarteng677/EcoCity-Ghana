import {
  communityReports,
  reportStatuses,
  reportUrgencies,
  type CommunityReport,
  type ReportStatus,
  type ReportUrgency
} from "@/data/communityReports";
import { getReportEvidenceImageCount } from "@/lib/evidence";
import { getDashboardModerationCounts, type DashboardModerationCounts } from "@/lib/reports";

export type CountItem<T extends string = string> = {
  label: T;
  count: number;
  percentage: number;
};

export type CommunityHotspot = CountItem & {
  dangerCount: number;
  urgentCount: number;
};

export type ServiceAreaInsight = CountItem & {
  openCount: number;
  dangerCount: number;
  urgentCount: number;
};

export type DashboardInsights = {
  totalReports: number;
  needsReviewReports: number;
  verifiedReports: number;
  assignedReports: number;
  inProgressReports: number;
  resolvedReports: number;
  rejectedReports: number;
  hiddenReports: number;
  dangerSignals: number;
  highEmergencyReports: number;
  communitiesRepresented: number;
  highPriorityServiceAreas: number;
  reportsNeedingMapLocation: number;
  reportsWithEvidence: number;
  totalEvidenceImages: number;
  statusOverview: CountItem<ReportStatus>[];
  urgencyBreakdown: CountItem<ReportUrgency>[];
  categoryBreakdown: CountItem[];
  communityHotspots: CommunityHotspot[];
  floodDrainageReports: CommunityReport[];
  floodDrainageCommunities: CountItem[];
  serviceAreas: ServiceAreaInsight[];
  recentPriorityReports: CommunityReport[];
};

const priorityUrgencies: ReportUrgency[] = ["High", "Emergency"];
const floodDrainageCategories = new Set(["Flooding", "Blocked Drain", "Poor Drainage", "Polluted Water"]);

function toPercentage(count: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

function sortByCountThenLabel<T extends CountItem>(items: T[]) {
  return [...items].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function countBy<T extends string>(reports: CommunityReport[], getKey: (report: CommunityReport) => T, orderedLabels?: T[]) {
  const counts = reports.reduce<Record<T, number>>((accumulator, report) => {
    const key = getKey(report);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {} as Record<T, number>);

  const labels = orderedLabels ?? (Object.keys(counts) as T[]);

  return labels.map((label) => ({
    label,
    count: counts[label] ?? 0,
    percentage: toPercentage(counts[label] ?? 0, reports.length)
  }));
}

function getCommunityHotspots(reports: CommunityReport[]) {
  const communities = Array.from(new Set(reports.map((report) => report.community)));

  return sortByCountThenLabel(
    communities.map((community) => {
      const communityReportsForArea = reports.filter((report) => report.community === community);
      const urgentCount = communityReportsForArea.filter((report) => priorityUrgencies.includes(report.urgency)).length;
      const dangerCount = communityReportsForArea.filter((report) => report.isDangerous).length;

      return {
        label: community,
        count: communityReportsForArea.length,
        percentage: toPercentage(communityReportsForArea.length, reports.length),
        dangerCount,
        urgentCount
      };
    })
  );
}

function getServiceAreaInsights(reports: CommunityReport[]) {
  const serviceAreas = Array.from(new Set(reports.map((report) => report.responsibleServiceArea)));

  return sortByCountThenLabel(
    serviceAreas.map((serviceArea) => {
      const serviceReports = reports.filter((report) => report.responsibleServiceArea === serviceArea);
      const openCount = serviceReports.filter((report) => !["resolved", "rejected", "duplicate"].includes(report.status)).length;
      const urgentCount = serviceReports.filter((report) => priorityUrgencies.includes(report.urgency)).length;
      const dangerCount = serviceReports.filter((report) => report.isDangerous).length;

      return {
        label: serviceArea,
        count: serviceReports.length,
        percentage: toPercentage(serviceReports.length, reports.length),
        openCount,
        urgentCount,
        dangerCount
      };
    })
  );
}

export function getDashboardInsights(reports = communityReports, moderationCounts: DashboardModerationCounts = getDashboardModerationCounts(reports)): DashboardInsights {
  const floodDrainageReports = reports.filter((report) => floodDrainageCategories.has(report.category));
  const serviceAreas = getServiceAreaInsights(reports);
  const evidenceImageCounts = reports.map(getReportEvidenceImageCount);

  return {
    totalReports: moderationCounts.totalSubmittedReports,
    needsReviewReports: moderationCounts.awaitingReviewReports,
    verifiedReports: reports.filter((report) => report.status === "verified").length,
    assignedReports: moderationCounts.assignedReports,
    inProgressReports: moderationCounts.inProgressReports,
    resolvedReports: moderationCounts.resolvedReports,
    rejectedReports: moderationCounts.rejectedReports,
    hiddenReports: moderationCounts.hiddenReports,
    dangerSignals: reports.filter((report) => report.isDangerous).length,
    highEmergencyReports: reports.filter((report) => priorityUrgencies.includes(report.urgency)).length,
    communitiesRepresented: new Set(reports.map((report) => report.community)).size,
    highPriorityServiceAreas: serviceAreas.filter((area) => area.urgentCount > 0 || area.dangerCount > 0).length,
    reportsNeedingMapLocation: reports.filter((report) => typeof report.latitude !== "number" || typeof report.longitude !== "number").length,
    reportsWithEvidence: evidenceImageCounts.filter((count) => count > 0).length,
    totalEvidenceImages: evidenceImageCounts.reduce((total, count) => total + count, 0),
    statusOverview: countBy(reports, (report) => report.status, reportStatuses),
    urgencyBreakdown: countBy(reports, (report) => report.urgency, reportUrgencies),
    categoryBreakdown: sortByCountThenLabel(countBy(reports, (report) => report.category)),
    communityHotspots: getCommunityHotspots(reports),
    floodDrainageReports,
    floodDrainageCommunities: sortByCountThenLabel(countBy(floodDrainageReports, (report) => report.community)),
    serviceAreas,
    recentPriorityReports: [...reports]
      .filter((report) => priorityUrgencies.includes(report.urgency) || report.isDangerous || report.status === "needs_review")
      .sort((a, b) => b.dateReported.localeCompare(a.dateReported))
      .slice(0, 5)
  };
}
