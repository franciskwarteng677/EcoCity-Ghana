"use client";

import Link from "next/link";
import { Menu, Trees, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/report", label: "Report Issue" },
  { href: "/reports", label: "Community Reports" },
  { href: "/map", label: "Map" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" }
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-civic-100 bg-white/95 shadow-sm shadow-civic-900/5 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-8" aria-label="Primary">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setIsOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-civic-700 text-white">
            <Trees className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-normal text-ink">EcoCity Ghana</span>
            <span className="block text-xs font-medium text-civic-700">Smart community reporting</span>
          </span>
        </Link>

        <div className="hidden min-w-0 items-center gap-5 xl:gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap text-sm font-semibold text-slate-700 transition hover:text-civic-700">
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/report"
          className="hidden rounded-md bg-civic-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-civic-900 lg:inline-flex"
        >
          Start a report
        </Link>

        <button
          type="button"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-civic-100 bg-white text-civic-700 shadow-sm lg:hidden"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>
      {isOpen ? (
        <div className="border-t border-civic-100 bg-white px-4 py-3 shadow-sm lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-civic-50 hover:text-civic-700"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
