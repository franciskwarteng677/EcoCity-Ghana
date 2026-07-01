import { Search, SlidersHorizontal, X } from "lucide-react";
import { reportStatuses, reportUrgencies, type CommunityReport, type ReportStatus, type ReportUrgency } from "@/data/communityReports";

export type ReportFilters = {
  search: string;
  category: string;
  status: string;
  urgency: string;
};

type ReportsFiltersProps = {
  filters: ReportFilters;
  categories: CommunityReport["category"][];
  onChange: (filters: ReportFilters) => void;
  onClear: () => void;
};

const selectClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-ink shadow-sm outline-none focus:border-civic-700 focus:ring-2 focus:ring-civic-100";

export function ReportsFilters({ filters, categories, onChange, onClear }: ReportsFiltersProps) {
  const hasFilters = Boolean(filters.search || filters.category || filters.status || filters.urgency);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-label="Community report filters">
      <div className="flex items-center gap-3">
        <SlidersHorizontal className="h-5 w-5 text-civic-700" aria-hidden="true" />
        <h2 className="text-lg font-bold text-ink">Find community reports</h2>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(150px,1fr))_auto] lg:items-end">
        <div>
          <label htmlFor="report-search" className="block text-sm font-bold text-ink">
            Search
          </label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="report-search"
              value={filters.search}
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
              className="w-full rounded-md border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-ink shadow-sm outline-none placeholder:text-slate-400 focus:border-civic-700 focus:ring-2 focus:ring-civic-100"
              placeholder="Search title, community, location, or service area"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category-filter" className="block text-sm font-bold text-ink">
            Category
          </label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(event) => onChange({ ...filters, category: event.target.value })}
            className={`mt-2 ${selectClass}`}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status-filter" className="block text-sm font-bold text-ink">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as ReportStatus | "" })}
            className={`mt-2 ${selectClass}`}
          >
            <option value="">All statuses</option>
            {reportStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="urgency-filter" className="block text-sm font-bold text-ink">
            Urgency
          </label>
          <select
            id="urgency-filter"
            value={filters.urgency}
            onChange={(event) => onChange({ ...filters, urgency: event.target.value as ReportUrgency | "" })}
            className={`mt-2 ${selectClass}`}
          >
            <option value="">All urgency levels</option>
            {reportUrgencies.map((urgency) => (
              <option key={urgency} value={urgency}>
                {urgency}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-civic-300 hover:text-civic-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>
    </section>
  );
}
