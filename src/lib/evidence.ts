import type { CommunityReport, ReportEvidence } from "@/data/communityReports";

export const REPORT_EVIDENCE_BUCKET = "report-evidence";
export const MAX_EVIDENCE_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_EVIDENCE_IMAGES = 5;

const acceptedEvidenceMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const acceptedEvidenceExtensions = ["jpg", "jpeg", "png", "webp"];

const fallbackExtensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export type EvidenceMetadata = {
  fileName: string;
  filePath: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
};

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function hasAcceptedEvidenceType(file: File) {
  return acceptedEvidenceMimeTypes.includes(file.type) || acceptedEvidenceExtensions.includes(getFileExtension(file.name));
}

export function getEvidenceMimeType(file: File) {
  if (acceptedEvidenceMimeTypes.includes(file.type)) {
    return file.type;
  }

  const extension = getFileExtension(file.name);

  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  return file.type || "image/jpeg";
}

export function validateEvidenceFile(file: File) {
  if (!hasAcceptedEvidenceType(file)) {
    return `"${file.name}" is not supported. Choose JPG, JPEG, PNG, or WebP images only.`;
  }

  if (file.size > MAX_EVIDENCE_FILE_BYTES) {
    return `"${file.name}" is larger than 20MB. Choose a smaller image or compress it before uploading.`;
  }

  return null;
}

export function validateEvidenceFiles(files: File[], existingFileCount = 0) {
  if (existingFileCount + files.length > MAX_EVIDENCE_IMAGES) {
    return `You can attach up to ${MAX_EVIDENCE_IMAGES} evidence images per report. Remove an image before adding another.`;
  }

  for (const file of files) {
    const validationError = validateEvidenceFile(file);

    if (validationError) {
      return validationError;
    }
  }

  return null;
}

export function formatEvidenceFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sanitizeFileName(file: File) {
  const originalName = file.name.split(/[/\\]/).pop() ?? "evidence";
  const normalizedName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  if (normalizedName && normalizedName.includes(".")) {
    return normalizedName;
  }

  const fallbackExtension = fallbackExtensionByMimeType[file.type] ?? "jpg";

  return `${normalizedName || "evidence"}.${fallbackExtension}`;
}

function createPathToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

export function createEvidenceStoragePath(reportId: string, file: File) {
  return `reports/${reportId}/${Date.now()}-${createPathToken()}-${sanitizeFileName(file)}`;
}

function getLegacyEvidenceImage(report: CommunityReport): ReportEvidence | null {
  if (!report.evidencePublicUrl && !report.evidenceFilePath) {
    return null;
  }

  return {
    id: `${report.id}-legacy-evidence`,
    reportId: report.id,
    fileName: report.evidenceFileName ?? report.evidenceLabel ?? "Evidence image",
    filePath: report.evidenceFilePath ?? "",
    publicUrl: report.evidencePublicUrl ?? null,
    fileSize: report.evidenceSizeBytes ?? null,
    mimeType: report.evidenceMimeType ?? null,
    createdAt: report.createdAt ?? report.dateReported
  };
}

export function getReportEvidenceImages(report: CommunityReport) {
  if (report.evidence && report.evidence.length > 0) {
    return report.evidence;
  }

  const legacyEvidence = getLegacyEvidenceImage(report);

  return legacyEvidence ? [legacyEvidence] : [];
}

export function getReportEvidenceImageCount(report: CommunityReport) {
  return getReportEvidenceImages(report).length;
}

export function getEvidenceAttachmentLabel(report: CommunityReport) {
  const evidenceCount = getReportEvidenceImageCount(report);

  if (evidenceCount === 1) {
    return "Evidence attached";
  }

  if (evidenceCount > 1) {
    return `${evidenceCount} evidence images attached`;
  }

  return "No evidence image attached.";
}
