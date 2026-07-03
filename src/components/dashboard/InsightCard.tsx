import type { LucideIcon } from "lucide-react";

type InsightCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: "civic" | "amber" | "red" | "slate";
};

const toneStyles = {
  civic: "bg-civic-50 text-civic-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-700"
};

export function InsightCard({ label, value, detail, icon: Icon, tone = "civic" }: InsightCardProps) {
  return (
    <article className="rounded-lg border border-civic-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-600">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-normal text-ink">{value}</p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${toneStyles[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  );
}

