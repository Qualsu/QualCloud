import { files } from "@/config/const/api.const";
import { api } from "@/config/routing/api.route";
import {
  FilesFavoriteBody,
  FilesFileResponse,
  FilesFolderCreateBody,
  FilesFolderDeleteBody,
  FilesMoveBody,
  FilesRestoreBody,
  FilesTrashBody,
  FilesUploadResponse,
  FilesUserStatsResponse,
} from "@/config/types/api.types";
import { FileDoc } from "@/config/types/components.types";
import { Id } from "../../../convex/_generated/dataModel";
import { getMimeType } from "./utils/get-mime";

function mapFile(file: FilesFileResponse): FileDoc {
  const deterministicId = `files_${file.account_id}` as unknown as Id<"users">;

  return {
    _id: file.file_id as Id<"files">,
    _creationTime: file.created_at
      ? new Date(file.created_at).getTime()
      : Date.now(),
    name: file.name,
    orgId: file.account_id,
    type: getMimeType(file.type),
    fileId: file.file_id as Id<"_storage">,
    userId: deterministicId,
    linkId: file.file_id,
    isFavorited: file.is_favorite ?? false,
    _isFromApi: true,
    downloads: 0,
    _expiresInSeconds: null,
    fileUrl: file.url,
  };
}

export async function getAllFiles(
  account_id: string,
  options?: {
    folder?: string | null;
    favorite?: boolean | null;
    deleted?: boolean;
  }
): Promise<FileDoc[]> {
  const res = await files.get(api.FILES.GET_ALL(account_id), {
    params: {
      folder: options?.folder,
      favorite: options?.favorite,
      deleted: options?.deleted,
    },
  });
  const filesResponse: FilesFileResponse[] = res.data.files ?? res.data;

  return filesResponse.map(mapFile);
}

export async function uploadFile(
  account_id: string,
  file: File,
  folder?: string | null
): Promise<FilesUploadResponse> {
  const formData = new FormData();
  formData.append("account_id", account_id);
  formData.append("file", file);
  if (folder !== undefined && folder !== null) {
    formData.append("folder", folder);
  }

  const res = await files.post(api.FILES.UPLOAD, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

export async function uploadMultipleFiles(
  account_id: string,
  filesList: File[],
  folder?: string | null
): Promise<FilesUploadResponse[]> {
  const formData = new FormData();
  formData.append("account_id", account_id);
  filesList.forEach((file) => formData.append("files", file));
  if (folder !== undefined && folder !== null) {
    formData.append("folder", folder);
  }

  const res = await files.post(api.FILES.UPLOAD_MULTIPLE, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

export async function getRecentFiles(account_id: string): Promise<FileDoc[]> {
  const res = await files.get(api.FILES.GET_RECENT(account_id));
  const filesResponse: FilesFileResponse[] = res.data.files ?? res.data;

  return filesResponse.map(mapFile);
}

export async function getFileInfo(file_id: string): Promise<FilesFileResponse> {
  const res = await files.get(api.FILES.INFO(file_id));
  return res.data;
}

export async function downloadFile(file_id: string): Promise<Blob> {
  const res = await files.get(api.FILES.DOWNLOAD(file_id), {
    responseType: "blob",
  });
  return res.data;
}

export async function moveFile(
  file_id: string,
  folder?: string | null
): Promise<unknown> {
  const body: FilesMoveBody = { file_id, folder };
  const res = await files.post(api.FILES.MOVE, body);
  return res.data;
}

export async function addToFavorites(file_id: string): Promise<unknown> {
  const body: FilesFavoriteBody = { file_id };
  const res = await files.post(api.FILES.FAVORITE, body);
  return res.data;
}

export async function removeFromFavorites(file_id: string): Promise<unknown> {
  const body: FilesFavoriteBody = { file_id };
  const res = await files.delete(api.FILES.FAVORITE, { data: body });
  return res.data;
}

export async function moveToTrash(file_id: string): Promise<unknown> {
  const body: FilesTrashBody = { file_id };
  const res = await files.post(api.FILES.TRASH, body);
  return res.data;
}

export async function restoreFromTrash(file_id: string): Promise<unknown> {
  const body: FilesRestoreBody = { file_id };
  const res = await files.post(api.FILES.RESTORE, body);
  return res.data;
}

export async function deleteFilePermanently(file_id: string): Promise<unknown> {
  const res = await files.delete(api.FILES.DELETE(file_id));
  return res.data;
}

export async function createFolder(
  account_id: string,
  name: string
): Promise<unknown> {
  const body: FilesFolderCreateBody = { account_id, name };
  const res = await files.post(api.FILES.FOLDER, body);
  return res.data;
}

export async function deleteFolder(
  account_id: string,
  name: string
): Promise<unknown> {
  const body: FilesFolderDeleteBody = { account_id, name };
  const res = await files.delete(api.FILES.FOLDER, { data: body });
  return res.data;
}

export async function emptyTrash(account_id: string): Promise<unknown> {
  const res = await files.post(api.FILES.EMPTY_TRASH(account_id));
  return res.data;
}

export async function getUserStats(
  account_id: string
): Promise<FilesUserStatsResponse> {
  const res = await files.get(api.FILES.USER_STATS(account_id));
  return res.data;
}
