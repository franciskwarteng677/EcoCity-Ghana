"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Camera, Info, Send, ShieldAlert } from "lucide-react";
import { CategorySelector } from "./CategorySelector";
import { FormField } from "./FormField";
import { ReportPreviewCard } from "./ReportPreviewCard";
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
};

type ReportFormErrors = Partial<Record<keyof ReportFormData, string>>;

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
  contactDetail: ""
};

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-civic-700 focus:ring-2 focus:ring-civic-100";

const errorInputClass = "border-red-500 focus:border-red-600 focus:ring-red-100";

function validateForm(data: ReportFormData) {
  const errors: ReportFormErrors = {};

  if (!data.category) {
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

  if (!data.urgency) {
    errors.urgency = "Choose an urgency level.";
  }

  return errors;
}

export function ReportForm() {
  const [formData, setFormData] = useState<ReportFormData>(initialFormData);
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [preparedReport, setPreparedReport] = useState<ReportFormData | null>(null);

  function updateField<Field extends keyof ReportFormData>(field: Field, value: ReportFormData[Field]) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setPreparedReport(null);
      return;
    }

    setPreparedReport({
      ...formData,
      community: formData.community.trim(),
      location: formData.location.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      reporterName: formData.reporterName.trim(),
      contactDetail: formData.contactDetail.trim()
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
      <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-6">
          <CategorySelector value={formData.category} onChange={(value) => updateField("category", value)} error={errors.category} />

          <div className="grid gap-5 md:grid-cols-2">
            <FormField id="community" label="Community or town" required error={errors.community}>
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

            <FormField id="location" label="Specific location or landmark" hint="Use a nearby school, junction, drain, market, road, or landmark.">
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
              className={inputClass}
              placeholder="Optional"
            />
          </FormField>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-civic-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-civic-900 focus:outline-none focus:ring-2 focus:ring-civic-700 focus:ring-offset-2 sm:w-fit"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Prepare report preview
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

        <ReportPreviewCard report={preparedReport} />
      </aside>
    </div>
  );
}
