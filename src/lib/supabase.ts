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
  evidence_file_name: string | null;
  evidence_file_path: string | null;
  evidence_public_url: string | null;
  evidence_mime_type: string | null;
  evidence_size_bytes: number | null;
  contact_preference: string | null;
  reporter_name: string | null;
  reporter_contact: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export type ReportUpdateRow = {
  id: string;
  report_id: string;
  status: ReportStatus;
  note: string | null;
  responsible_service_area: string | null;
  is_public: boolean;
  created_at: string;
};

export type ReportUpdateInsert = {
  report_id: string;
  status: ReportStatus;
  note?: string | null;
  responsible_service_area?: string | null;
  is_public?: boolean;
};

export type CommunityReportInsert = {
  id?: string;
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
  evidence_file_name?: string | null;
  evidence_file_path?: string | null;
  evidence_public_url?: string | null;
  evidence_mime_type?: string | null;
  evidence_size_bytes?: number | null;
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
      report_updates: {
        Row: ReportUpdateRow;
        Insert: ReportUpdateInsert;
        Update: Partial<ReportUpdateInsert>;
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
