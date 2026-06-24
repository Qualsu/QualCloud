import { extension } from "mime-types";
import { FileDoc } from "@/config/types/components.types";
import { extensionFormatMap, FILE_SIZE_LABELS } from "@/config/const/files.const";

export function formatExpiresIn(
  seconds: number | null,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (seconds === null) return t("expiresIn.expired");

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return t("expiresIn.remaining", { days, hours, minutes });
}

export function isFileExpired(file: FileDoc): boolean {
    const expiresInSeconds = file._expiresInSeconds;
    if (expiresInSeconds === undefined) return false;
    return expiresInSeconds === null || expiresInSeconds <= 0;
}

export function formatSize(bytes: number): string {
    if (bytes === 0) return "0 Б";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${FILE_SIZE_LABELS[i]}`;
}

export function getFileFormatDisplay(
  fileName: string,
  fileType: string,
  isFolder: boolean | undefined,
  t: (key: string) => string,
  contentType?: string | null
): string {
  if (isFolder) return t("fileTypes.folder");

  let ext = "";
  if (contentType) {
    const mimeExt = extension(contentType);
    if (mimeExt) {
      ext = mimeExt.toLowerCase();
    }
  }

  if (!ext) {
    ext = fileName.split(".").pop()?.toLowerCase() || "";
  }

  if (!ext) return fileType;

  return extensionFormatMap[ext] || ext;
}
