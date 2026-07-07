"use client";

import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import maplibregl, { type LngLatLike, type Map as MapLibreMap, type Marker } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  reportCategories,
  reportStatuses,
  reportUrgencies,
  getReportStatusLabel,
  type CommunityReport,
  type ReportStatus,
  type ReportUrgency
} from "@/data/communityReports";
import { useCommunityReports } from "@/hooks/useCommunityReports";
import type { ReportCoordinates } from "@/lib/communityCoordinates";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { UrgencyBadge } from "@/components/reports/UrgencyBadge";
import { VisibilityBadge } from "@/components/reports/VisibilityBadge";

type MapFilters = {
  category: string;
  urgency: string;
  status: string;
};

const initialFilters: MapFilters = {
  category: "",
  urgency: "",
  status: ""
};

type MapDisplayReport = CommunityReport & {
  coordinates: ReportCoordinates;
};

const accraCenter: LngLatLike = [-0.1869, 5.6037];

const urgencyMarkerStyles: Record<ReportUrgency, { color: string; label: string }> = {
  Low: { color: "#64748b", label: "Low" },
  Medium: { color: "#178f82", label: "Medium" },
  High: { color: "#b66a3c", label: "High" },
  Emergency: { color: "#dc2626", label: "Emergency" }
};

function hasUsableCoordinates(report: CommunityReport): report is CommunityReport & { latitude: number; longitude: number } {
  return (
    typeof report.latitude === "number" &&
    Number.isFinite(report.latitude) &&
    report.latitude >= -90 &&
    report.latitude <= 90 &&
    typeof report.longitude === "number" &&
    Number.isFinite(report.longitude) &&
    report.longitude >= -180 &&
    report.longitude <= 180
  );
}

function matchesFilters(report: Pick<CommunityReport, "category" | "urgency" | "status">, filters: MapFilters) {
  const categoryMatch = filters.category ? report.category === filters.category : true;
  const urgencyMatch = filters.urgency ? report.urgency === filters.urgency : true;
  const statusMatch = filters.status ? report.status === filters.status : true;

  return categoryMatch && urgencyMatch && statusMatch;
}

function createMarkerElement(report: MapDisplayReport, isSelected: boolean) {
  const marker = document.createElement("button");
  marker.type = "button";
  marker.setAttribute("aria-label", `${report.title} in ${report.community}`);
  marker.className = [
    "ecg-map-marker",
    isSelected ? "ecg-map-marker-selected" : "",
    report.isDangerous ? "ecg-map-marker-danger" : ""
  ]
    .filter(Boolean)
    .join(" ");
  marker.style.setProperty("--marker-color", urgencyMarkerStyles[report.urgency].color);
  marker.innerHTML = `<span></span>`;

  return marker;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  options,
  getOptionLabel,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  getOptionLabel?: (value: string) => string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-civic-100 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-civic-500 focus:ring-2 focus:ring-civic-100"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {getOptionLabel ? getOptionLabel(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SetupNotice() {
  return (
    <div className="grid min-h-[440px] place-items-center rounded-lg border border-civic-100 bg-white p-6 shadow-soft">
      <div className="max-w-xl text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-civic-50 text-civic-700">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-normal text-ink">Map key required</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add a local MapTiler browser key to enable the interactive community issue map. Keep the value in your environment file and restart the development server after changing it.
        </p>
        <code className="mt-5 inline-flex rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-civic-900">
          NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here
        </code>
      </div>
    </div>
  );
}

export function CommunityMap() {
  const mapKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const { reports, source, isLoading, error } = useCommunityReports();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [filters, setFilters] = useState<MapFilters>(initialFilters);
  const [selectedReportId, setSelectedReportId] = useState("");

  const mappedReports = useMemo(
    () =>
      reports
        .filter(hasUsableCoordinates)
        .map((report) => {
          const coordinates = [report.longitude, report.latitude] satisfies ReportCoordinates;

          return { ...report, coordinates };
        }),
    [reports]
  );

  const unmappedReports = useMemo(() => reports.filter((report) => !hasUsableCoordinates(report)), [reports]);

  const categories = useMemo(() => {
    const categorySet = new Set(reports.map((report) => report.category));
    const categoriesForFilters = categorySet.size > 0 ? Array.from(categorySet) : reportCategories;

    return [...categoriesForFilters].sort();
  }, [reports]);

  const filteredReports = useMemo(() => mappedReports.filter((report) => matchesFilters(report, filters)), [filters, mappedReports]);
  const filteredUnmappedReports = useMemo(() => unmappedReports.filter((report) => matchesFilters(report, filters)), [filters, unmappedReports]);
  const selectedReport = filteredReports.find((report) => report.id === selectedReportId) ?? filteredReports[0] ?? null;

  useEffect(() => {
    if (isLoading || error || !mapKey || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapKey}`,
      center: accraCenter,
      zoom: 10.45,
      attributionControl: { compact: true }
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [error, isLoading, mapKey]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = filteredReports.map((report) => {
      const element = createMarkerElement(report, selectedReport?.id === report.id);
      element.addEventListener("click", () => setSelectedReportId(report.id));

      return new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat(report.coordinates).addTo(map);
    });
  }, [filteredReports, selectedReport?.id]);

  useEffect(() => {
    if (!selectedReport && filteredReports[0]) {
      setSelectedReportId(filteredReports[0].id);
    }
  }, [filteredReports, selectedReport]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedReport) {
      return;
    }

    map.flyTo({
      center: selectedReport.coordinates,
      zoom: Math.max(map.getZoom(), 11.4),
      essential: true
    });
  }, [selectedReport]);

  const updateFilter = (key: keyof MapFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const hasFilters = Boolean(filters.category || filters.urgency || filters.status);
  const hasPublicReports = reports.length > 0;

  if (!mapKey) {
    return <SetupNotice />;
  }

  if (isLoading) {
    return (
      <div className="grid min-h-[440px] place-items-center rounded-lg border border-civic-100 bg-white p-6 text-center shadow-soft">
        <div>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-civic-700" aria-hidden="true" />
          <p className="mt-4 text-sm font-bold text-ink">Loading map reports</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Fetching report locations for the community map.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 shadow-soft" role="alert">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold">Unable to load map reports</h2>
            <p className="mt-2 text-sm leading-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {source === "sample" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
          Supabase environment variables are not configured, so the map uses local starter reports.
        </div>
      ) : null}
      {!hasPublicReports ? (
        <div className="rounded-lg border border-civic-100 bg-white p-5 text-sm font-semibold leading-6 text-slate-600 shadow-soft">
          No public reports are available for the map yet. Reports will appear here when they are awaiting review or approved for public visibility.
        </div>
      ) : null}
      <section className="rounded-lg border border-civic-100 bg-white p-4 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-4 md:grid-cols-3">
            <SelectFilter label="Category" value={filters.category} options={categories} onChange={(value) => updateFilter("category", value)} />
            <SelectFilter label="Urgency" value={filters.urgency} options={reportUrgencies} onChange={(value) => updateFilter("urgency", value)} />
            <SelectFilter label="Status" value={filters.status} options={reportStatuses} getOptionLabel={(value) => getReportStatusLabel(value as ReportStatus)} onChange={(value) => updateFilter("status", value)} />
          </div>
          <button
            type="button"
            onClick={() => setFilters(initialFilters)}
            disabled={!hasFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-civic-100 bg-white px-4 text-sm font-bold text-civic-700 shadow-sm transition hover:bg-civic-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </button>
        </div>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="min-w-0 overflow-hidden rounded-lg border border-civic-100 bg-white shadow-soft">
          <div ref={mapContainerRef} className="h-[520px] min-h-[420px] w-full" aria-label="Interactive map of EcoCity Ghana community reports" />
        </div>

        <aside className="grid gap-4 rounded-lg border border-civic-100 bg-white p-5 shadow-soft">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-civic-700">Selected report</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Showing {filteredReports.length} of {mappedReports.length} mapped reports
            </p>
          </div>

          {selectedReport ? (
            <div className="grid gap-5">
              <div>
                <h2 className="text-2xl font-bold tracking-normal text-ink">{selectedReport.title}</h2>
                <p className="mt-2 text-sm font-semibold text-civic-700">{selectedReport.community}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex w-fit rounded-md bg-civic-50 px-2.5 py-1 text-xs font-bold text-civic-700">
                  {selectedReport.category}
                </span>
                <UrgencyBadge urgency={selectedReport.urgency} />
                <StatusBadge status={selectedReport.status as ReportStatus} />
                {selectedReport.publicVisibility === "under_review" ? <VisibilityBadge visibility={selectedReport.publicVisibility} /> : null}
              </div>

              <dl className="grid gap-4 rounded-lg bg-slate-50 p-4">
                <Field label="Location detail" value={selectedReport.locationDetail} />
                <Field label="Responsible service area" value={selectedReport.responsibleServiceArea} />
                <Field label="Danger noted" value={selectedReport.isDangerous ? "Yes" : "No"} />
              </dl>

              <p className="text-sm leading-6 text-slate-600">{selectedReport.description}</p>
            </div>
          ) : (
            <div className="rounded-lg bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
              {hasPublicReports
                ? "No mapped reports match the current filters."
                : "No public map pins are available yet."}
            </div>
          )}

          <div className="border-t border-civic-100 pt-4">
            <h3 className="text-sm font-bold text-ink">Legend</h3>
            <div className="mt-3 grid gap-2">
              {reportUrgencies.map((urgency) => (
                <div key={urgency} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: urgencyMarkerStyles[urgency].color }} />
                  {urgencyMarkerStyles[urgency].label} urgency
                </div>
              ))}
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <span className="h-3 w-3 rounded-full border-2 border-red-600 bg-white" />
                Danger noted
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-civic-100 bg-white p-5 shadow-soft" aria-labelledby="unmapped-reports-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="unmapped-reports-heading" className="text-xl font-bold tracking-normal text-ink">
              Reports without map location
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These reports are saved and included in reports and dashboard analytics, but need a current location, map pin, or coordinates before they can appear as map markers.
            </p>
          </div>
          <p className="text-sm font-bold text-civic-700">
            {filteredUnmappedReports.length} {filteredUnmappedReports.length === 1 ? "report" : "reports"}
          </p>
        </div>

        {filteredUnmappedReports.length === 0 ? (
          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
            {hasPublicReports
              ? "Every report in the current filter has map coordinates."
              : "No public reports without map locations are available yet."}
          </div>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {filteredUnmappedReports.map((report) => (
              <article key={report.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic-700">{report.category}</p>
                    <h3 className="mt-2 text-base font-bold text-ink">{report.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <UrgencyBadge urgency={report.urgency} />
                    <StatusBadge status={report.status} />
                    {report.publicVisibility === "under_review" ? <VisibilityBadge visibility={report.publicVisibility} /> : null}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  <span className="font-bold text-ink">{report.community}</span> - {report.locationDetail || "Location detail not provided"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
