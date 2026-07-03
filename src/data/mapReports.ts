import { communityReports, type CommunityReport } from "./communityReports";

export type MapReport = CommunityReport & {
  coordinates: [number, number];
};

const reportCoordinates: Record<string, [number, number]> = {
  "ECG-1042": [-0.2606, 5.5662],
  "ECG-1041": [-0.2354, 5.5657],
  "ECG-1040": [-0.1073, 5.5831],
  "ECG-1039": [-0.2034, 5.5881],
  "ECG-1038": [-0.1668, 5.6818],
  "ECG-1037": [-0.0332, 5.692],
  "ECG-1036": [-0.0079, 5.6532],
  "ECG-1035": [-0.1827, 5.5557],
  "ECG-1034": [-0.2538, 5.6061],
  "ECG-1033": [-0.1671, 5.7043]
};

export const mapReports: MapReport[] = communityReports.map((report) => ({
  ...report,
  coordinates: reportCoordinates[report.id]
}));

