"use client";

import Link from "next/link";
import { Menu, Trees, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/report", label: "Report Issue" },
  { href: "/reports", label: "Community Reports" },
  { href: "/map", label: "Map" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" }
];

const focusVisibleClasses =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-500 focus-visible:ring-offset-2";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/reports") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return pathname === href;
}

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-[100] w-full border-b border-civic-100 bg-white shadow-sm shadow-civic-900/5">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-5 lg:px-8" aria-label="Primary">
        <Link
          href="/"
          className={`flex min-w-0 items-center gap-3 rounded-md ${focusVisibleClasses}`}
          onClick={() => setIsOpen(false)}
        >
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-civic-700 text-white">
            <Trees className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-normal text-ink">EcoCity Ghana</span>
            <span className="block text-xs font-medium text-civic-700">Smart community reporting</span>
          </span>
        </Link>

        <div className="hidden min-w-0 items-center gap-2 lg:flex xl:gap-3">
          {navLinks.map((link) => {
            const isActive = isActivePath(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`whitespace-nowrap rounded-md border-b-2 px-2.5 py-2 text-sm font-semibold transition-colors duration-150 ${focusVisibleClasses} ${
                  isActive
                    ? "border-civic-500 bg-civic-50 text-civic-900"
                    : "border-transparent text-slate-700 hover:border-civic-100 hover:bg-civic-50 hover:text-civic-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/report"
          className={`hidden min-h-10 shrink-0 items-center justify-center rounded-md bg-civic-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition duration-150 hover:bg-civic-900 hover:shadow-md active:translate-y-px active:bg-civic-900 active:shadow-none lg:inline-flex ${focusVisibleClasses}`}
        >
          Start a report
        </Link>

        <button
          type="button"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-md border border-civic-100 bg-white text-civic-700 shadow-sm transition-colors duration-150 hover:bg-civic-50 hover:text-civic-900 active:bg-civic-100 lg:hidden ${focusVisibleClasses}`}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-primary-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>
      {isOpen ? (
        <nav
          id="mobile-primary-navigation"
          className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-civic-100 bg-white px-4 py-3 shadow-sm lg:hidden"
          aria-label="Mobile primary"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {navLinks.map((link) => {
              const isActive = isActivePath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-md border-l-4 px-3 py-3 text-sm font-semibold transition-colors duration-150 ${focusVisibleClasses} ${
                    isActive
                      ? "border-civic-500 bg-civic-50 text-civic-900"
                      : "border-transparent text-slate-700 hover:bg-civic-50 hover:text-civic-900"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/report"
              className={`mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-civic-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition duration-150 hover:bg-civic-900 hover:shadow-md active:translate-y-px active:bg-civic-900 active:shadow-none ${focusVisibleClasses}`}
              onClick={() => setIsOpen(false)}
            >
              Start a report
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
