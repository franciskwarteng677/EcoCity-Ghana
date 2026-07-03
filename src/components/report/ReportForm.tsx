"use client";

import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { AlertCircle, Camera, Info, LocateFixed, Loader2, Search, Send, ShieldAlert } from "lucide-react";
import { isReportCategory, isReportUrgency } from "@/data/communityReports";
import { submitCommunityReport, type NewCommunityReport } from "@/lib/reports";
import { CategorySelector } from "./CategorySelector";
import { FormField } from "./FormField";
import { LocationPicker } from "./LocationPicker";
import { ReportPreviewCard } from "./ReportPreviewCard";
import { SubmissionNotice } from "./SubmissionNotice";
import { UrgencySelector } from "./UrgencySelector";

export type ReportFormData = {
  category: string;
  community: string;
  location: string;
  title: string;
  description: string;
  urgency: string;
  isDangerous: boolean;
  evidenceName: string;
  contactPreference: string;
  reporterName: string;
  contactDetail: string;
  latitude: string;
  longitude: string;
};

type ReportFormErrors = Partial<Record<keyof ReportFormData, string>>;

type MapTilerGeocodeResponse = {
  features?: Array<{
    center?: [number, number];
    place_name?: string;
    text?: string;
  }>;
};

const initialFormData: ReportFormData = {
  category: "",
  community: "",
  location: "",
  title: "",
  description: "",
  urgency: "",
  isDangerous: false,
  evidenceName: "",
  contactPreference: "No contact needed",
  reporterName: "",
  contactDetail: "",
  latitude: "",
  longitude: ""
};

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-civic-700 focus:ring-2 focus:ring-civic-100";

const errorInputClass = "border-red-500 focus:border-red-600 focus:ring-red-100";

function parseOptionalCoordinate(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const numericValue = Number(trimmedValue);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function isValidLatitude(value: number | null) {
  return value !== null && value >= -90 && value <= 90;
}

function isValidLongitude(value: number | null) {
  return value !== null && value >= -180 && value <= 180;
}

function validateForm(data: ReportFormData) {
  const errors: ReportFormErrors = {};
  const hasLatitude = Boolean(data.latitude.trim());
  const hasLongitude = Boolean(data.longitude.trim());
  const latitude = parseOptionalCoordinate(data.latitude);
  const longitude = parseOptionalCoordinate(data.longitude);

  if (!data.category || !isReportCategory(data.category)) {
    errors.category = "Choose the issue category.";
  }

  if (!data.community.trim()) {
    errors.community = "Enter the community or town.";
  }

  if (!data.title.trim()) {
    errors.title = "Enter a short issue title.";
  }

  if (!data.description.trim()) {
    errors.description = "Describe the issue.";
  } else if (data.description.trim().length < 40) {
    errors.description = "Add a little more detail so the issue can be understood clearly.";
  }

  if (!data.urgency || !isReportUrgency(data.urgency)) {
    errors.urgency = "Choose an urgency level.";
  }

  if (data.contactPreference === "Contact me for follow-up" && !data.contactDetail.trim()) {
    errors.contactDetail = "Enter a phone number or email for follow-up.";
  }

  if (hasLatitude && latitude === null) {
    errors.latitude = "Enter a valid latitude.";
  } else if (latitude !== null && (latitude < -90 || latitude > 90)) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }

  if (hasLongitude && longitude === null) {
    errors.longitude = "Enter a valid longitude.";
  } else if (longitude !== null && (longitude < -180 || longitude > 180)) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }

  if (hasLatitude && !hasLongitude) {
    errors.longitude = "Longitude is required when latitude is provided.";
  }

  if (hasLongitude && !hasLatitude) {
    errors.latitude = "Latitude is required when longitude is provided.";
  }

  return errors;
}

function hasDraftContent(data: ReportFormData) {
  return Boolean(
    data.category ||
      data.community.trim() ||
      data.location.trim() ||
      data.title.trim() ||
      data.description.trim() ||
      data.urgency ||
      data.isDangerous ||
      data.evidenceName ||
      data.reporterName.trim() ||
      data.contactDetail.trim() ||
      data.latitude.trim() ||
      data.longitude.trim()
  );
}

function sanitizeFormData(data: ReportFormData): ReportFormData {
  return {
    ...data,
    community: data.community.trim(),
    location: data.location.trim(),
    title: data.title.trim(),
    description: data.description.trim(),
    reporterName: data.reporterName.trim(),
    contactDetail: data.contactDetail.trim(),
    latitude: data.latitude.trim(),
    longitude: data.longitude.trim()
  };
}

function toNewCommunityReport(data: ReportFormData): NewCommunityReport | null {
  if (!isReportCategory(data.category) || !isReportUrgency(data.urgency)) {
    return null;
  }

  const shouldStoreContact = data.contactPreference === "Contact me for follow-up";
  const latitude = parseOptionalCoordinate(data.latitude);
  const longitude = parseOptionalCoordinate(data.longitude);

  return {
    category: data.category,
    title: data.title,
    community: data.community,
    locationDetail: data.location,
    description: data.description,
    urgency: data.urgency,
    dangerNoted: data.isDangerous,
    evidenceLabel: data.evidenceName || null,
    contactPreference: data.contactPreference,
    reporterName: shouldStoreContact ? data.reporterName || null : null,
    reporterContact: shouldStoreContact ? data.contactDetail || null : null,
    latitude,
    longitude
  };
}

export function ReportForm() {
  const [formData, setFormData] = useState<ReportFormData>(initialFormData);
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [preparedReport, setPreparedReport] = useState<ReportFormData | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submittedReportMapped, setSubmittedReportMapped] = useState<boolean | undefined>(undefined);

  function updateField<Field extends keyof ReportFormData>(field: Field, value: ReportFormData[Field]) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setPreparedReport(null);
    setSubmittedReportId(null);
    setSubmittedReportMapped(undefined);
    setSubmitError(null);
    setLocationMessage(null);
    setLocationError(null);
  }

  const setReportCoordinates = useCallback((coordinates: { latitude: number; longitude: number }, message: string) => {
    setFormData((current) => ({
      ...current,
      latitude: formatCoordinate(coordinates.latitude),
      longitude: formatCoordinate(coordinates.longitude)
    }));
    setErrors((current) => ({ ...current, latitude: undefined, longitude: undefined }));
    setPreparedReport(null);
    setSubmittedReportId(null);
    setSubmittedReportMapped(undefined);
    setSubmitError(null);
    setLocationMessage(message);
    setLocationError(null);
  }, []);

  const handleMapSelectLocation = useCallback(
    (coordinates: { latitude: number; longitude: number }) => {
      setReportCoordinates(coordinates, "Map pin selected. This report will be ready for map display.");
    },
    [setReportCoordinates]
  );

  function handleUseCurrentLocation() {
    setLocationMessage(null);
    setLocationError(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Location capture is not available in this browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setReportCoordinates(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          "Current location captured. This report will be ready for map display."
        );
        setIsLocating(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. You can still submit the report or drop a pin on the map."
            : "Unable to capture your location. You can still submit the report or drop a pin on the map.";

        setLocationError(message);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  async function handleFindTypedLocation() {
    const mapKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    const query = [formData.location.trim(), formData.community.trim(), "Ghana"].filter(Boolean).join(", ");

    setLocationMessage(null);
    setLocationError(null);

    if (!query.trim()) {
      setLocationError("Enter a community, landmark, street, or area before searching.");
      return;
    }

    if (!mapKey) {
      setLocationError("Location search needs the local MapTiler key. You can still use the map pin or submit without coordinates.");
      return;
    }

    setIsSearchingLocation(true);

    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${mapKey}&country=gh&limit=1&language=en`
      );

      if (!response.ok) {
        throw new Error("Location search was not available.");
      }

      const result = (await response.json()) as MapTilerGeocodeResponse;
      const firstResult = result.features?.find((feature) => Array.isArray(feature.center) && feature.center.length === 2);

      if (!firstResult?.center) {
        setLocationError("No map match was found. You can drop a pin or submit the report without coordinates.");
        return;
      }

      setReportCoordinates(
        {
          latitude: firstResult.center[1],
          longitude: firstResult.center[0]
        },
        `${firstResult.place_name ?? firstResult.text ?? "Location"} found. Review the map pin before submitting.`
      );
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Location search was not available.");
    } finally {
      setIsSearchingLocation(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(formData);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      setPreparedReport(null);
      return;
    }

    const sanitizedData = sanitizeFormData(formData);
    const newReport = toNewCommunityReport(sanitizedData);

    if (!newReport) {
      setSubmitError("Review the category and urgency fields before submitting this report.");
      return;
    }

    setIsSubmitting(true);

    try {
      const savedReport = await submitCommunityReport(newReport);
      const isMapped = typeof savedReport.latitude === "number" && typeof savedReport.longitude === "number";
      setPreparedReport(sanitizedData);
      setSubmittedReportId(savedReport.id);
      setSubmittedReportMapped(isMapped);
      setFormData(initialFormData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit this report right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const previewReport = preparedReport ?? (hasDraftContent(formData) ? formData : null);
  const parsedLatitude = parseOptionalCoordinate(formData.latitude);
  const parsedLongitude = parseOptionalCoordinate(formData.longitude);
  const selectedLatitude = isValidLatitude(parsedLatitude) ? parsedLatitude : null;
  const selectedLongitude = isValidLongitude(parsedLongitude) ? parsedLongitude : null;
  const hasSelectedMapLocation = selectedLatitude !== null && selectedLongitude !== null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
      <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-6">
          {submittedReportId ? <SubmissionNotice reportId={submittedReportId} isMapped={submittedReportMapped} /> : null}

          {submitError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800" role="alert">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>{submitError}</p>
              </div>
            </div>
          ) : null}

          <CategorySelector value={formData.category} onChange={(value) => updateField("category", value)} error={errors.category} />

          <section className="rounded-lg border border-civic-100 bg-civic-50 p-4" aria-labelledby="report-location-heading">
            <div>
              <h2 id="report-location-heading" className="text-lg font-bold text-ink">
                Location
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Describe the area, then use current location or drop a pin if you can. Reports can still be submitted without a map location.
              </p>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <FormField id="community" label="Community, area, or town" required error={errors.community}>
                <input
                  id="community"
                  value={formData.community}
                  onChange={(event) => updateField("community", event.target.value)}
                  className={`${inputClass} ${errors.community ? errorInputClass : ""}`}
                  aria-invalid={Boolean(errors.community)}
                  aria-describedby={errors.community ? "community-error" : undefined}
                  placeholder="Example: Madina"
                />
              </FormField>

              <FormField id="location" label="Landmark, street, or location detail" hint="Use a nearby school, junction, drain, market, road, or landmark.">
                <input
                  id="location"
                  value={formData.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  className={inputClass}
                  aria-describedby="location-hint"
                  placeholder="Example: Near the main lorry station"
                />
              </FormField>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-civic-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-civic-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLocating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="h-4 w-4" aria-hidden="true" />}
                {isLocating ? "Capturing location" : "Use my current location"}
              </button>

              <button
                type="button"
                onClick={handleFindTypedLocation}
                disabled={isSearchingLocation}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-civic-100 bg-white px-4 text-sm font-bold text-civic-700 shadow-sm transition hover:bg-civic-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSearchingLocation ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
                {isSearchingLocation ? "Finding location" : "Find typed location"}
              </button>
            </div>

            {locationMessage ? <p className="mt-3 text-sm font-semibold text-civic-900">{locationMessage}</p> : null}
            {locationError ? <p className="mt-3 text-sm font-semibold text-red-700">{locationError}</p> : null}

            <div className="mt-5">
              <LocationPicker latitude={selectedLatitude} longitude={selectedLongitude} onSelect={handleMapSelectLocation} />
            </div>

            <div className="mt-3 rounded-md bg-white px-3 py-2 text-xs font-bold text-slate-600">
              {hasSelectedMapLocation
                ? `Map location selected: ${formData.latitude}, ${formData.longitude}`
                : "No map pin selected yet. The report can still be submitted and will be listed as needing map location."}
            </div>

            <details className="mt-4 rounded-lg border border-civic-100 bg-white p-4">
              <summary className="cursor-pointer text-sm font-bold text-ink">Manual coordinates</summary>
              <p className="mt-2 text-sm leading-6 text-slate-600">Optional testing fields for teams that already know exact latitude and longitude.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormField id="latitude" label="Latitude" error={errors.latitude}>
                  <input
                    id="latitude"
                    value={formData.latitude}
                    onChange={(event) => updateField("latitude", event.target.value)}
                    className={`${inputClass} ${errors.latitude ? errorInputClass : ""}`}
                    inputMode="decimal"
                    aria-invalid={Boolean(errors.latitude)}
                    aria-describedby={errors.latitude ? "latitude-error" : undefined}
                    placeholder="Example: 5.603700"
                  />
                </FormField>

                <FormField id="longitude" label="Longitude" error={errors.longitude}>
                  <input
                    id="longitude"
                    value={formData.longitude}
                    onChange={(event) => updateField("longitude", event.target.value)}
                    className={`${inputClass} ${errors.longitude ? errorInputClass : ""}`}
                    inputMode="decimal"
                    aria-invalid={Boolean(errors.longitude)}
                    aria-describedby={errors.longitude ? "longitude-error" : undefined}
                    placeholder="Example: -0.186900"
                  />
                </FormField>
              </div>
            </details>
          </section>

          <FormField id="title" label="Short issue title" required error={errors.title}>
            <input
              id="title"
              value={formData.title}
              onChange={(event) => updateField("title", event.target.value)}
              className={`${inputClass} ${errors.title ? errorInputClass : ""}`}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
              placeholder="Example: Blocked drain causing water to collect"
            />
          </FormField>

          <FormField id="description" label="Detailed description" required error={errors.description} hint="Include what happened, how long it has been happening, who is affected, and any visible risks.">
            <textarea
              id="description"
              value={formData.description}
              onChange={(event) => updateField("description", event.target.value)}
              className={`${inputClass} min-h-36 resize-y ${errors.description ? errorInputClass : ""}`}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "description-error description-hint" : "description-hint"}
              placeholder="Describe the issue in enough detail for review."
            />
          </FormField>

          <UrgencySelector value={formData.urgency} onChange={(value) => updateField("urgency", value)} error={errors.urgency} />

          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={formData.isDangerous}
              onChange={(event) => updateField("isDangerous", event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-civic-700 focus:ring-civic-700"
            />
            <span>
              <span className="block text-sm font-bold text-ink">This issue is currently dangerous</span>
              <span className="mt-1 block text-sm leading-6 text-slate-600">Select this if there is immediate risk to pedestrians, drivers, homes, businesses, or public health.</span>
            </span>
          </label>

          <FormField id="evidence" label="Evidence or photo" hint="Photo selection is for review preparation only. Files are not uploaded or stored.">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-civic-500 bg-civic-50 px-4 py-7 text-center transition hover:bg-civic-100">
              <Camera className="h-8 w-8 text-civic-700" aria-hidden="true" />
              <span className="mt-3 text-sm font-bold text-ink">{formData.evidenceName || "Choose a photo or evidence file"}</span>
              <span className="mt-1 text-xs text-slate-600">PNG, JPG, or PDF details can be selected locally.</span>
              <input
                id="evidence"
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                className="sr-only"
                onChange={(event) => updateField("evidenceName", event.target.files?.[0]?.name ?? "")}
                aria-describedby="evidence-hint"
              />
            </label>
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField id="contactPreference" label="Reporter contact preference">
              <select
                id="contactPreference"
                value={formData.contactPreference}
                onChange={(event) => updateField("contactPreference", event.target.value)}
                className={inputClass}
              >
                <option>No contact needed</option>
                <option>Contact me for follow-up</option>
                <option>Keep my name private</option>
              </select>
            </FormField>

            <FormField id="reporterName" label="Reporter name">
              <input
                id="reporterName"
                value={formData.reporterName}
                onChange={(event) => updateField("reporterName", event.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </FormField>
          </div>

          <FormField id="contactDetail" label="Phone or email">
            <input
              id="contactDetail"
              value={formData.contactDetail}
              onChange={(event) => updateField("contactDetail", event.target.value)}
              className={`${inputClass} ${errors.contactDetail ? errorInputClass : ""}`}
              aria-invalid={Boolean(errors.contactDetail)}
              aria-describedby={errors.contactDetail ? "contactDetail-error" : undefined}
              placeholder="Optional"
            />
            {errors.contactDetail ? (
              <p id="contactDetail-error" className="mt-2 text-sm font-semibold text-red-700">
                {errors.contactDetail}
              </p>
            ) : null}
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-civic-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-civic-900 focus:outline-none focus:ring-2 focus:ring-civic-700 focus:ring-offset-2 sm:w-fit"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            {isSubmitting ? "Submitting report" : "Submit report"}
          </button>
        </div>
      </form>

      <aside className="grid gap-5 lg:sticky lg:top-28">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <Info className="mt-1 h-5 w-5 shrink-0 text-civic-700" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold text-ink">What makes a useful report</h2>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
                <li>Describe the exact location or nearest landmark.</li>
                <li>Explain the impact on residents, roads, drainage, sanitation, or safety.</li>
                <li>Add urgency only when the issue needs faster attention.</li>
                <li>Include evidence only when it is safe to collect.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div>
              <h2 className="text-base font-bold text-ink">Privacy and safety note</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Do not enter floodwater, blocked drains, unstable roads, unsafe structures, or tense situations to collect evidence. Keep personal details limited to what you are comfortable sharing.
              </p>
            </div>
          </div>
        </div>

        <ReportPreviewCard report={previewReport} />
      </aside>
    </div>
  );
}
