"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, LockKeyhole, Loader2, ShieldCheck } from "lucide-react";
import { AdminReview } from "./AdminReview";

type AdminAccessGateProps = {
  initialHasAccess: boolean;
};

type AdminAuthResponse = {
  authenticated?: boolean;
  message?: string;
  error?: string;
};

type AccessState = "checking" | "locked" | "unlocked";

const adminAccessSessionKey = "ecocity_admin_access_verified";
const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-civic-700 focus:ring-2 focus:ring-civic-100";

function AccessFeedback({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  const toneClass =
    tone === "success" ? "border-canopy-100 bg-canopy-100 text-canopy-800" : "border-red-200 bg-red-50 text-red-700";
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className={`rounded-md border p-3 text-sm font-semibold leading-6 ${toneClass}`} role={tone === "error" ? "alert" : "status"}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>{children}</p>
      </div>
    </div>
  );
}

function CheckingAccessScreen() {
  return (
    <section className="grid min-h-[320px] place-items-center rounded-lg border border-civic-100 bg-white p-8 text-center shadow-sm">
      <div>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-civic-700" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-bold tracking-normal text-ink">Checking admin access</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Verifying the current admin session before loading the review console.</p>
      </div>
    </section>
  );
}

export function AdminAccessGate({ initialHasAccess }: AdminAccessGateProps) {
  const [accessState, setAccessState] = useState<AccessState>(initialHasAccess ? "unlocked" : "locked");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (initialHasAccess) {
      sessionStorage.setItem(adminAccessSessionKey, "true");
      return;
    }

    if (sessionStorage.getItem(adminAccessSessionKey) !== "true") {
      return;
    }

    let isMounted = true;

    async function verifyStoredSession() {
      setAccessState("checking");

      try {
        const response = await fetch("/api/admin/auth", { method: "GET" });
        const result = (await response.json()) as AdminAuthResponse;

        if (!isMounted) {
          return;
        }

        if (response.ok && result.authenticated) {
          setAccessState("unlocked");
          return;
        }

        sessionStorage.removeItem(adminAccessSessionKey);
        setAccessState("locked");
      } catch {
        if (!isMounted) {
          return;
        }

        sessionStorage.removeItem(adminAccessSessionKey);
        setAccessState("locked");
      }
    }

    void verifyStoredSession();

    return () => {
      isMounted = false;
    };
  }, [initialHasAccess]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isChecking) {
      return;
    }

    setIsChecking(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ adminCode })
      });
      const result = (await response.json()) as AdminAuthResponse;

      if (!response.ok || !result.authenticated) {
        throw new Error(result.error ?? "Unable to verify admin access.");
      }

      sessionStorage.setItem(adminAccessSessionKey, "true");
      setSuccessMessage(result.message ?? "Admin access verified. Review console unlocked.");
      setAdminCode("");
      setAccessState("unlocked");
    } catch (error) {
      sessionStorage.removeItem(adminAccessSessionKey);
      setError(error instanceof Error ? error.message : "Unable to verify admin access.");
    } finally {
      setIsChecking(false);
    }
  }

  if (accessState === "unlocked") {
    return (
      <div className="grid gap-6">
        {successMessage ? <AccessFeedback tone="success">{successMessage}</AccessFeedback> : null}
        <AdminReview />
      </div>
    );
  }

  if (accessState === "checking") {
    return <CheckingAccessScreen />;
  }

  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-civic-100 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="admin-access-heading">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-civic-50 text-civic-700">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic-700">Restricted console</p>
          <h2 id="admin-access-heading" className="mt-2 text-2xl font-bold tracking-normal text-ink">
            Admin access required
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The EcoCity Ghana review console is restricted to authorized administrators. Enter the admin review code to unlock submitted reports, evidence, status tools, and private reporter contact details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-ink" htmlFor="admin-access-code">
          Admin review code
          <input
            id="admin-access-code"
            value={adminCode}
            onChange={(event) => {
              setAdminCode(event.target.value);
              setError(null);
            }}
            className={`${inputClass} ${error ? "border-red-500 focus:border-red-600 focus:ring-red-100" : ""}`}
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "admin-access-error" : "admin-access-note"}
            required
          />
        </label>

        <p id="admin-access-note" className="text-xs font-semibold leading-5 text-slate-500">
          The code is checked server-side and is not exposed to the browser.
        </p>

        {error ? (
          <div id="admin-access-error">
            <AccessFeedback tone="error">{error}</AccessFeedback>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isChecking}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-civic-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-civic-900 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
        >
          {isChecking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
          {isChecking ? "Checking access..." : "Unlock admin console"}
        </button>
      </form>
    </section>
  );
}
