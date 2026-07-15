import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ReportCategory, ReportStatus, ReportUrgency, ReportVisibility } from "@/data/communityReports";

export type CommunityReportRow = {
  id: string;
  category: ReportCategory;
  title: string;
  community: string;
  location_detail: string;
  description: string;
  urgency: ReportUrgency;
  status: ReportStatus;
  public_visibility: ReportVisibility;
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

export type PublicCommunityReportRow = Pick<
  CommunityReportRow,
  | "id"
  | "category"
  | "title"
  | "community"
  | "location_detail"
  | "description"
  | "urgency"
  | "status"
  | "public_visibility"
  | "service_area"
  | "danger_noted"
  | "evidence_label"
  | "evidence_file_name"
  | "evidence_file_path"
  | "evidence_public_url"
  | "evidence_mime_type"
  | "evidence_size_bytes"
  | "latitude"
  | "longitude"
  | "created_at"
>;

export type PublicReportDashboardSummaryRow = {
  total_public_reports: number;
  awaiting_review_reports: number;
  assigned_reports: number;
  in_progress_reports: number;
  resolved_reports: number;
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

export type ReportEvidenceRow = {
  id: string;
  report_id: string;
  file_name: string;
  file_path: string;
  public_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string | null;
};

export type ReportEvidenceInsert = {
  id?: string;
  report_id: string;
  file_name: string;
  file_path: string;
  public_url?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  created_at?: string | null;
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
  public_visibility?: ReportVisibility;
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
      report_evidence: {
        Row: ReportEvidenceRow;
        Insert: ReportEvidenceInsert;
        Update: Partial<ReportEvidenceInsert>;
        Relationships: [];
      };
    };
    Views: {
      public_reports: {
        Row: PublicCommunityReportRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      public_report_dashboard_summary: {
        Row: PublicReportDashboardSummaryRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
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
