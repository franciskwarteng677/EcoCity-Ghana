import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ReportCategory, ReportStatus, ReportUrgency } from "@/data/communityReports";

export type CommunityReportRow = {
  id: string;
  category: ReportCategory;
  title: string;
  community: string;
  location_detail: string;
  description: string;
  urgency: ReportUrgency;
  status: ReportStatus;
  service_area: string;
  danger_noted: boolean;
  evidence_label: string | null;
  contact_preference: string | null;
  reporter_name: string | null;
  reporter_contact: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export type CommunityReportInsert = {
  category: ReportCategory;
  title: string;
  community: string;
  location_detail: string;
  description: string;
  urgency: ReportUrgency;
  status?: ReportStatus;
  service_area: string;
  danger_noted: boolean;
  evidence_label?: string | null;
  contact_preference?: string | null;
  reporter_name?: string | null;
  reporter_contact?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type Database = {
  public: {
    Tables: {
      reports: {
        Row: CommunityReportRow;
        Insert: CommunityReportInsert;
        Update: Partial<CommunityReportInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let browserClient: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
    );
  }

  return browserClient;
}
