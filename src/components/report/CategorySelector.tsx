import {
  AlertTriangle,
  Droplets,
  Lightbulb,
  MapPin,
  Recycle,
  ShieldAlert,
  Trash2,
  Waves
} from "lucide-react";

export const issueCategories = [
  { label: "Flooding", icon: Waves },
  { label: "Blocked Drain", icon: Droplets },
  { label: "Poor Drainage", icon: Droplets },
  { label: "Illegal Dumping", icon: Trash2 },
  { label: "Sanitation Concern", icon: Recycle },
  { label: "Polluted Water", icon: Droplets },
  { label: "Unsafe Road", icon: AlertTriangle },
  { label: "Broken Streetlight", icon: Lightbulb },
  { label: "Public Infrastructure", icon: MapPin },
  { label: "Community Safety", icon: ShieldAlert }
];

type CategorySelectorProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function CategorySelector({ value, onChange, error }: CategorySelectorProps) {
  return (
    <fieldset aria-describedby={error ? "category-error" : undefined}>
      <legend className="text-sm font-bold text-ink">
        Issue category <span className="text-civic-700">*</span>
      </legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {issueCategories.map(({ label, icon: Icon }) => {
          const isSelected = value === label;

          return (
            <label
              key={label}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-white p-4 text-sm font-semibold transition ${
                isSelected ? "border-civic-700 ring-2 ring-civic-100" : "border-slate-200 hover:border-civic-300"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={label}
                checked={isSelected}
                onChange={() => onChange(label)}
                className="sr-only"
              />
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${isSelected ? "bg-civic-700 text-white" : "bg-civic-50 text-civic-700"}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-ink">{label}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id="category-error" className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
