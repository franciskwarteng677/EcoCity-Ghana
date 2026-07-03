import type { CommunityReport } from "@/data/communityReports";

export type ReportCoordinates = [number, number];

const communityCoordinates: Record<string, ReportCoordinates> = {
  odorkor: [-0.2606, 5.5662],
  kaneshie: [-0.2354, 5.5657],
  teshie: [-0.1073, 5.5831],
  nima: [-0.2034, 5.5881],
  madina: [-0.1668, 5.6818],
  ashaiman: [-0.0332, 5.692],
  "tema community 5": [-0.0079, 5.6532],
  osu: [-0.1827, 5.5557],
  lapaz: [-0.2538, 5.6061],
  adenta: [-0.1671, 5.7043]
};

export function getCoordinatesForCommunity(community: string) {
  return communityCoordinates[community.trim().toLowerCase()] ?? null;
}

export function getReportCoordinates(report: Pick<CommunityReport, "community" | "latitude" | "longitude">) {
  if (typeof report.latitude === "number" && typeof report.longitude === "number") {
    return [report.longitude, report.latitude] satisfies ReportCoordinates;
  }

  return getCoordinatesForCommunity(report.community);
}

