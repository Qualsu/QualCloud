import { FileDoc } from "@/config/types/components.types";
import { extensionFormatMap, FILE_SIZE_LABELS } from "@/config/const/files.const";

export function formatExpiresIn(seconds: number | null): string {
    if (seconds === null) return "Истек";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `Осталось: ${days}д ${hours}ч ${minutes}м`;
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

export function getFileFormatDisplay(fileName: string, fileType: string, isFolder?: boolean): string {
  if (isFolder) return "Папка";

  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (!ext) return fileType;

  return extensionFormatMap[ext] || ext;
}
