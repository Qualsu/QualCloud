import { shrtl } from "@/config/const/api.const";
import { api } from "@/config/routing/api.route";
import { ShrtlFileResponse } from "@/config/types/api.types";
import { Id } from "../../../convex/_generated/dataModel";
import { getMimeType } from "./utils/get-mime";

export async function getAllFiles(account_id: string) {
  const res = await shrtl.get(api.SHRTL.GET_ALL(account_id));
  const shrtlFiles: ShrtlFileResponse[] = res.data.files;
  
  return shrtlFiles.map((file) => {
    const deterministicId = `shrtl_${file.short_id}` as unknown as Id<"users">;
    
    return {
      _id: file.short_id as Id<"files">,
      _creationTime: Date.now(),
      name: file.file_name,
      orgId: account_id,
      type: getMimeType(file.file_type),
      contentType: file.file_type,
      fileId: file.short_id as Id<"_storage">,
      userId: deterministicId,
      linkId: file.short_id,
      isFavorited: false,
      _isFromApi: true,
      _expiresInSeconds: file.expires_in_seconds,
      downloads: file.downloads,
      fileUrl: file.file_url,
      fileSize: file.file_size,
    };
  });
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await shrtl.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function deleteFile(shortId: string) {
  const res = await shrtl.delete("/files/delete", {
    data: { short_id: shortId },
  });
  return res.data;
}