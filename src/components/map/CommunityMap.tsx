"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import maplibregl, { type LngLatLike, type Map as MapLibreMap, type Marker } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { mapReports, type MapReport } from "@/data/mapReports";
import { reportStatuses, reportUrgencies, type ReportStatus, type ReportUrgency } from "@/data/communityReports";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { UrgencyBadge } from "@/components/reports/UrgencyBadge";

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

const accraCenter: LngLatLike = [-0.1869, 5.6037];

const urgencyMarkerStyles: Record<ReportUrgency, { color: string; label: string }> = {
  Low: { color: "#64748b", label: "Low" },
  Medium: { color: "#178f82", label: "Medium" },
  High: { color: "#b66a3c", label: "High" },
  Emergency: { color: "#dc2626", label: "Emergency" }
};

function matchesFilters(report: MapReport, filters: MapFilters) {
  const categoryMatch = filters.category ? report.category === filters.category : true;
  const urgencyMatch = filters.urgency ? report.urgency === filters.urgency : true;
  const statusMatch = filters.status ? report.status === filters.status : true;

  return categoryMatch && urgencyMatch && statusMatch;
}

function createMarkerElement(report: MapReport, isSelected: boolean) {
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
  onChange
}: {
  label: string;
  value: string;
  options: string[];
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
            {option}
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [filters, setFilters] = useState<MapFilters>(initialFilters);
  const [selectedReportId, setSelectedReportId] = useState(mapReports[0]?.id ?? "");

  const categories = useMemo(() => Array.from(new Set(mapReports.map((report) => report.category))).sort(), []);

  const filteredReports = useMemo(() => mapReports.filter((report) => matchesFilters(report, filters)), [filters]);
  const selectedReport = filteredReports.find((report) => report.id === selectedReportId) ?? filteredReports[0] ?? null;

  useEffect(() => {
    if (!mapKey || !mapContainerRef.current || mapRef.current) {
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
  }, [mapKey]);

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

  if (!mapKey) {
    return <SetupNotice />;
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-civic-100 bg-white p-4 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-4 md:grid-cols-3">
            <SelectFilter label="Category" value={filters.category} options={categories} onChange={(value) => updateFilter("category", value)} />
            <SelectFilter label="Urgency" value={filters.urgency} options={reportUrgencies} onChange={(value) => updateFilter("urgency", value)} />
            <SelectFilter label="Status" value={filters.status} options={reportStatuses} onChange={(value) => updateFilter("status", value)} />
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
              Showing {filteredReports.length} of {mapReports.length} reports
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
              No reports match the current filters.
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
    </div>
  );
}
