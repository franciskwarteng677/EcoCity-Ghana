"use client";

import { useEffect, useState } from "react";
import type { CommunityReport } from "@/data/communityReports";
import { fetchCommunityReports, type ReportDataSource } from "@/lib/reports";

type CommunityReportsState = {
  reports: CommunityReport[];
  source: ReportDataSource;
  isLoading: boolean;
  error: string | null;
};

export function useCommunityReports() {
  const [state, setState] = useState<CommunityReportsState>({
    reports: [],
    source: "supabase",
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      try {
        const result = await fetchCommunityReports();

        if (!isMounted) {
          return;
        }

        setState({
          reports: result.reports,
          source: result.source,
          isLoading: false,
          error: null
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          reports: [],
          source: "supabase",
          isLoading: false,
          error: error instanceof Error ? error.message : "Unable to load community reports."
        });
      }
    }

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}

