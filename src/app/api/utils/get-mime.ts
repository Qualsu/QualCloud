import { FileType } from "@/config/types/components.types";

export function getMimeType(mimeType: string): FileType {
  const type = mimeType.toLowerCase();
  
  if (type.startsWith("image/")) {
    return type === "image/png" || type === "image/jpeg" || type === "image/jpg" 
      ? "image" 
      : "imageother";
  }
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type.includes("presentation") || type === "application/vnd.ms-powerpoint") return "pptx";
  if (type === "application/pdf" || type.includes("document")) return "txt";
  if (type.includes("sheet") || type.includes("excel")) return "table";
  if (type === "application/x-msdownload" || type === "application/exe") return "exe";
  if (type.includes("zip") || type.includes("rar") || type.includes("7z")) return "archive";
  if (type.includes("database") || type === "application/x-sqlite3") return "db";
  if (type.includes("text") || type === "text/plain") return "txt";
  
  return "txt";
}