import type { ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({ id, label, required, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
        {required ? <span className="text-civic-700"> *</span> : null}
      </label>
      <div className="mt-2">{children}</div>
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
