import type { Metadata } from "next";

import { getFileInfo } from "@/app/api/files";
import FilePageClient from "./file-page-client";

type FilePageProps = {
  params: { id: string };
  searchParams: { account_id?: string };
};

export async function generateMetadata({
  params,
  searchParams,
}: FilePageProps): Promise<Metadata> {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const accountId = searchParams.account_id;

  if (!id) {
    return { title: "File" };
  }

  try {
    const file = await getFileInfo(id, accountId);
    if (file?.file_name) {
      return { title: file.file_name };
    }
  } catch {
  }

  return { title: "File" };
}

export default function FilePage() {
  return <FilePageClient />;
}
