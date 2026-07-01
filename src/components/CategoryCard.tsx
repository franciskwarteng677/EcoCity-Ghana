import type { LucideIcon } from "lucide-react";

type CategoryCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function CategoryCard({ title, description, icon: Icon }: CategoryCardProps) {
  return (
    <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 transition hover:border-civic-500 hover:shadow-soft">
      <div className="flex min-w-0 items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-clay-100 text-clay-500">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </article>
  );
}
