export const urgencyLevels = [
  {
    label: "Low",
    description: "Needs attention but is not time-sensitive."
  },
  {
    label: "Medium",
    description: "Affects daily movement, sanitation, or local comfort."
  },
  {
    label: "High",
    description: "Could cause harm, damage, or disruption soon."
  },
  {
    label: "Emergency",
    description: "Presents immediate danger and needs urgent attention."
  }
];

type UrgencySelectorProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function UrgencySelector({ value, onChange, error }: UrgencySelectorProps) {
  return (
    <fieldset aria-describedby={error ? "urgency-error" : undefined}>
      <legend className="text-sm font-bold text-ink">
        Urgency level <span className="text-civic-700">*</span>
      </legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {urgencyLevels.map((level) => {
          const isSelected = value === level.label;

          return (
            <label
              key={level.label}
              className={`cursor-pointer rounded-lg border bg-white p-4 transition ${
                isSelected ? "border-civic-700 ring-2 ring-civic-100" : "border-slate-200 hover:border-civic-300"
              }`}
            >
              <input
                type="radio"
                name="urgency"
                value={level.label}
                checked={isSelected}
                onChange={() => onChange(level.label)}
                className="sr-only"
              />
              <span className="block text-sm font-bold text-ink">{level.label}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-600">{level.description}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id="urgency-error" className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
