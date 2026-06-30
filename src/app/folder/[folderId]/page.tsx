import type { Metadata } from "next";

import { getFolderById } from "@/app/api/files";
import { base64Decode } from "@/lib/utils";
import FolderPageClient from "./folder-page-client";

type FolderPageProps = {
  params: { folderId: string };
};

function parseFolderId(raw: string): string | null {
  if (!raw) return null;

  // Backward compatibility: old links were base64-encoded JSON payloads.
  try {
    const decoded = base64Decode(raw);
    if (decoded) {
      const payload = JSON.parse(decoded);
      if (payload?.folderId) return payload.folderId;
    }
  } catch {
    // Not a base64 JSON payload — treat as plain folderId.
  }

  return raw;
}

export async function generateMetadata({
  params,
}: FolderPageProps): Promise<Metadata> {
  const rawFolderId = Array.isArray(params.folderId)
    ? params.folderId[0]
    : params.folderId;
  const folderId = parseFolderId(rawFolderId);

  if (!folderId) {
    return { title: "Folder" };
  }

  try {
    const data = await getFolderById(folderId);
    const folderPath = data.folder?.name ?? "";
    const folderName = folderPath.split("/").pop() || folderPath;
    if (folderName) {
      return { title: folderName };
    }
  } catch {
    // ignore and fall back to default title
  }

  return { title: "Folder" };
}

export default function FolderPage() {
  return <FolderPageClient />;
}
