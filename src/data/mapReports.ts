import { communityReports, type CommunityReport } from "./communityReports";
import { getReportCoordinates, type ReportCoordinates } from "@/lib/communityCoordinates";

export type MapReport = CommunityReport & {
  coordinates: ReportCoordinates;
};

function toMapReport(report: CommunityReport) {
  const coordinates = getReportCoordinates(report);

  if (!coordinates) {
    return null;
  }

  return {
    ...report,
    coordinates
  };
}

export const mapReports: MapReport[] = communityReports
  .map(toMapReport)
  .filter((report): report is MapReport => Boolean(report));
