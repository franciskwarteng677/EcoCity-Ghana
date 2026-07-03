"use client";

import { AlertCircle } from "lucide-react";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import { useEffect, useRef } from "react";

type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onSelect: (coordinates: { latitude: number; longitude: number }) => void;
};

const accraCenter: [number, number] = [-0.1869, 5.6037];

function createPickerMarkerElement() {
  const marker = document.createElement("span");
  marker.className = "ecg-location-picker-marker";
  marker.setAttribute("aria-hidden", "true");

  return marker;
}

export function LocationPicker({ latitude, longitude, onSelect }: LocationPickerProps) {
  const mapKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!mapKey || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapKey}`,
      center: longitude !== null && latitude !== null ? [longitude, latitude] : accraCenter,
      zoom: longitude !== null && latitude !== null ? 14 : 10.35,
      attributionControl: { compact: true }
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.on("click", (event) => {
      onSelect({
        latitude: Number(event.lngLat.lat.toFixed(6)),
        longitude: Number(event.lngLat.lng.toFixed(6))
      });
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [mapKey, onSelect]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || latitude === null || longitude === null) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({
        element: createPickerMarkerElement(),
        anchor: "bottom",
        draggable: true
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      markerRef.current.on("dragend", () => {
        const lngLat = markerRef.current?.getLngLat();

        if (!lngLat) {
          return;
        }

        onSelect({
          latitude: Number(lngLat.lat.toFixed(6)),
          longitude: Number(lngLat.lng.toFixed(6))
        });
      });
    } else {
      markerRef.current.setLngLat([longitude, latitude]);
    }

    map.flyTo({
      center: [longitude, latitude],
      zoom: Math.max(map.getZoom(), 14),
      essential: true
    });
  }, [latitude, longitude, onSelect]);

  if (!mapKey) {
    return (
      <div className="grid min-h-[260px] place-items-center rounded-lg border border-civic-100 bg-white p-5 text-center">
        <div className="max-w-md">
          <AlertCircle className="mx-auto h-8 w-8 text-civic-700" aria-hidden="true" />
          <p className="mt-3 text-sm font-bold text-ink">Map picker needs a MapTiler key</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Add `NEXT_PUBLIC_MAPTILER_KEY` locally to choose a report location on the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-civic-100 bg-white">
      <div ref={mapContainerRef} className="h-[320px] min-h-[280px] w-full" aria-label="Choose report location on map" />
    </div>
  );
}
