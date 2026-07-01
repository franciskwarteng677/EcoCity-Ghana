import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-civic-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] lg:px-8">
        <div className="min-w-0">
          <p className="text-lg font-bold text-ink">EcoCity Ghana</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            A civic technology platform for cleaner, safer, and more responsive Ghanaian communities.
          </p>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink">Platform</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/report">Report Issue</Link>
            <Link href="/reports">Community Reports</Link>
            <Link href="/map">Map</Link>
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink">Project</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
