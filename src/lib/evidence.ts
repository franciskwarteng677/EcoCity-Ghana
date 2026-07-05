export const REPORT_EVIDENCE_BUCKET = "report-evidence";
export const MAX_EVIDENCE_FILE_BYTES = 20 * 1024 * 1024;

const acceptedEvidenceMimeTypes = ["image/jpeg", "image/png", "image/webp"];

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

export function validateEvidenceFile(file: File) {
  if (!acceptedEvidenceMimeTypes.includes(file.type)) {
    return "Choose a JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_EVIDENCE_FILE_BYTES) {
    return "Evidence images must be 20MB or smaller. Please choose a smaller image or compress the photo before uploading.";
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

export function createEvidenceStoragePath(reportId: string, file: File) {
  return `reports/${reportId}/${Date.now()}-${sanitizeFileName(file)}`;
}
