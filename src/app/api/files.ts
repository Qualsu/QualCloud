import { files } from "@/config/const/api.const";
import { api } from "@/config/routing/api.route";
import {
  FilesFavoriteBody,
  FilesFileResponse,
  FilesFolderCreateBody,
  FilesFolderDeleteBody,
  FilesFolderItem,
  FilesFolderMoveBody,
  FilesFolderPublicBody,
  FilesFolderRenameBody,
  FilesFolderRestoreBody,
  FilesFolderTrashBody,
  FilesFoldersResponse,
  FilesListItem,
  FilesListResponse,
  FilesMoveBody,
  FilesPublicBody,
  FilesRenameBody,
  FilesRestoreBody,
  FilesTrashBody,
  FilesUploadResponse,
  FilesUserStatsResponse,
} from "@/config/types/api.types";
import { FileDoc } from "@/config/types/components.types";
import { Id } from "../../../convex/_generated/dataModel";
import { getMimeType } from "./utils/get-mime";

export interface FilesApiEditor {
  username?: string;
  avatar_url?: string;
}

function editorBody(editor?: FilesApiEditor) {
  return {
    updated_by: editor?.username,
    updated_by_avatar: editor?.avatar_url,
  };
}

function mapFile(file: FilesFileResponse, fallbackAccountId?: string): FileDoc {
  const accountId = file.account_id ?? fallbackAccountId ?? "";
  const deterministicId = `files_${accountId}` as unknown as Id<"users">;

  return {
    _id: file.file_id as Id<"files">,
    _creationTime: file.uploaded_at
      ? new Date(file.uploaded_at).getTime()
      : Date.now(),
    name: file.file_name,
    orgId: accountId,
    type: getMimeType(file.file_type),
    contentType: file.file_type,
    fileId: file.file_id as Id<"_storage">,
    userId: deterministicId,
    linkId: file.file_id,
    isFavorited: file.is_favorite ?? false,
    isDeleted: file.is_deleted ?? false,
    _isFromApi: true,
    downloads: 0,
    fileUrl: file.file_url || undefined,
    fileSize: file.file_size,
    folder: file.folder ?? null,
    updatedBy: file.updated_by,
    lastEditorUsername: file.last_editor?.username,
    lastEditorAvatar: file.last_editor?.avatar_url,
    updatedAt: file.updated_at
      ? new Date(file.updated_at).getTime()
      : file.uploaded_at
      ? new Date(file.uploaded_at).getTime()
      : undefined,
    isPublic: file.is_public ?? false,
  };
}

function isFolderItem(item: FilesListItem): item is FilesFolderItem {
  return item.type === "folder";
}

function mapFolder(
  folder: FilesFolderItem,
  fallbackAccountId?: string,
  currentFolder?: string | null
): FileDoc {
  const accountId = fallbackAccountId ?? "";
  const deterministicId = `files_${accountId}` as unknown as Id<"users">;

  const displayName = folder.name.split("/").pop() || folder.name;

  return {
    _id: `folder_${folder.name}` as unknown as Id<"files">,
    _creationTime: folder.created_at
      ? new Date(folder.created_at).getTime()
      : Date.now(),
    name: folder.name,
    displayName,
    orgId: accountId,
    type: "folder",
    fileId: "" as Id<"_storage">,
    userId: deterministicId,
    linkId: folder.name,
    folderId: folder.folder_id,
    isFolder: true,
    folder: currentFolder ?? null,
    updatedBy: folder.updated_by,
    lastEditorUsername: folder.last_editor?.username,
    lastEditorAvatar: folder.last_editor?.avatar_url,
    updatedAt: folder.updated_at
      ? new Date(folder.updated_at).getTime()
      : folder.created_at
      ? new Date(folder.created_at).getTime()
      : undefined,
    isDeleted: folder.is_deleted ?? false,
    isPublic: folder.is_public ?? false,
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
  const data: FilesListResponse = res.data;
  let items: FilesListItem[] = [];

  if (Array.isArray(data.items) && data.items.length > 0) {
    items = data.items;
  } else if (Array.isArray(data.files)) {
    items = data.files;
  } else if (Array.isArray(data)) {
    items = data as FilesFileResponse[];
  }

  return items.map((item) =>
    isFolderItem(item)
      ? mapFolder(item, account_id, options?.folder)
      : mapFile(item, account_id)
  );
}

export async function uploadFile(
  account_id: string,
  file: File,
  folder?: string | null,
  editor?: FilesApiEditor
): Promise<FilesUploadResponse> {
  const formData = new FormData();
  formData.append("account_id", account_id);
  formData.append("file", file);
  if (folder !== undefined && folder !== null) {
    formData.append("folder", folder);
  }
  if (editor?.username !== undefined) {
    formData.append("updated_by", editor.username);
  }
  if (editor?.avatar_url !== undefined) {
    formData.append("updated_by_avatar", editor.avatar_url);
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
  folder?: string | null,
  editor?: FilesApiEditor
): Promise<FilesUploadResponse[]> {
  const formData = new FormData();
  formData.append("account_id", account_id);
  filesList.forEach((file) => formData.append("files", file));
  if (folder !== undefined && folder !== null) {
    formData.append("folder", folder);
  }
  if (editor?.username !== undefined) {
    formData.append("updated_by", editor.username);
  }
  if (editor?.avatar_url !== undefined) {
    formData.append("updated_by_avatar", editor.avatar_url);
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

  return filesResponse.map((file) => mapFile(file, account_id));
}

export async function getFileInfo(
  file_id: string,
  account_id?: string
): Promise<FilesFileResponse> {
  const res = await files.get(api.FILES.INFO(file_id), {
    params: account_id ? { account_id } : undefined,
  });
  return res.data;
}

export interface FilesFolderContentsResponse {
  account_id?: string;
  folder: FilesFolderItem;
  files: FileDoc[];
  folders: FileDoc[];
}

export async function getFolderById(
  folder_id: string,
  requester_id?: string
): Promise<FilesFolderContentsResponse> {
  const res = await files.get(api.FILES.GET_FOLDER(folder_id), {
    params: requester_id ? { requester_id } : undefined,
  });
  const data: { account_id?: string; folder: FilesFolderItem; files: FilesFileResponse[]; folders: FilesFolderItem[] } = res.data;
  const accountId = data.account_id ?? "";
  const currentFolder = data.folder?.name ?? null;
  return {
    account_id: accountId,
    folder: data.folder,
    files: (data.files ?? []).map((file) => mapFile(file, accountId)),
    folders: (data.folders ?? []).map((folder) => mapFolder(folder, accountId, currentFolder)),
  };
}

export async function downloadFile(
  file_id: string,
  account_id?: string
): Promise<Blob> {
  const res = await files.get(api.FILES.DOWNLOAD(file_id), {
    params: account_id ? { account_id } : undefined,
    responseType: "blob",
  });
  return res.data;
}

export async function moveFile(
  file_id: string,
  folder?: string | null,
  editor?: FilesApiEditor
): Promise<unknown> {
  const body: FilesMoveBody = { file_id, folder, ...editorBody(editor) };
  const res = await files.post(api.FILES.MOVE, body);
  return res.data;
}

export async function renameFile(
  file_id: string,
  file_name: string,
  editor?: FilesApiEditor
): Promise<FilesFileResponse> {
  const body: FilesRenameBody = { file_id, file_name, ...editorBody(editor) };
  const res = await files.post(api.FILES.RENAME, body);
  return res.data;
}

export async function updateFilePublic(
  file_id: string,
  is_public: boolean,
  editor?: FilesApiEditor
): Promise<FilesFileResponse> {
  const body: FilesPublicBody = { file_id, is_public, ...editorBody(editor) };
  const res = await files.post(api.FILES.PUBLIC, body);
  return res.data;
}

export async function addToFavorites(
  file_id: string,
  editor?: FilesApiEditor
): Promise<unknown> {
  const body: FilesFavoriteBody = { file_id, ...editorBody(editor) };
  const res = await files.post(api.FILES.FAVORITE, body);
  return res.data;
}

export async function removeFromFavorites(
  file_id: string,
  editor?: FilesApiEditor
): Promise<unknown> {
  const body: FilesFavoriteBody = { file_id, ...editorBody(editor) };
  const res = await files.delete(api.FILES.FAVORITE, { data: body });
  return res.data;
}

export async function moveToTrash(
  file_id: string,
  editor?: FilesApiEditor
): Promise<unknown> {
  const body: FilesTrashBody = { file_id, ...editorBody(editor) };
  const res = await files.post(api.FILES.TRASH, body);
  return res.data;
}

export async function restoreFromTrash(
  file_id: string,
  editor?: FilesApiEditor
): Promise<unknown> {
  const body: FilesRestoreBody = { file_id, ...editorBody(editor) };
  const res = await files.post(api.FILES.RESTORE, body);
  return res.data;
}

export async function deleteFilePermanently(file_id: string): Promise<unknown> {
  const res = await files.delete(api.FILES.DELETE(file_id));
  return res.data;
}

export async function createFolder(
  account_id: string,
  name: string,
  parent?: string | null,
  editor?: FilesApiEditor
): Promise<unknown> {
  const body: FilesFolderCreateBody = {
    account_id,
    name,
    parent,
    ...editorBody(editor),
  };
  const res = await files.post(api.FILES.FOLDER, body);
  return res.data;
}

export async function renameFolder(
  account_id: string,
  old_name: string,
  new_name: string,
  editor?: FilesApiEditor
): Promise<unknown> {
  const body: FilesFolderRenameBody = {
    account_id,
    old_name,
    new_name,
    ...editorBody(editor),
  };
  const res = await files.post(api.FILES.FOLDER_RENAME, body);
  return res.data;
}

export async function moveFolder(
  account_id: string,
  name: string,
  parent?: string | null,
  editor?: FilesApiEditor
): Promise<unknown> {
  const body: FilesFolderMoveBody = {
    account_id,
    name,
    parent,
    ...editorBody(editor),
  };
  const res = await files.post(api.FILES.FOLDER_MOVE, body);
  return res.data;
}

export async function moveFolderToTrash(
  account_id: string,
  name: string,
  editor?: FilesApiEditor
): Promise<unknown> {
  const body: FilesFolderTrashBody = {
    account_id,
    name,
    ...editorBody(editor),
  };
  const res = await files.post(api.FILES.FOLDER_TRASH, body);
  return res.data;
}

export async function restoreFolder(
  account_id: string,
  name: string,
  editor?: FilesApiEditor
): Promise<unknown> {
  const body: FilesFolderRestoreBody = {
    account_id,
    name,
    ...editorBody(editor),
  };
  const res = await files.post(api.FILES.FOLDER_RESTORE, body);
  return res.data;
}

export async function deleteFolder(
  account_id: string,
  name: string,
  editor?: FilesApiEditor
): Promise<unknown> {
  const body: FilesFolderDeleteBody = {
    account_id,
    name,
    ...editorBody(editor),
  };
  const res = await files.delete(api.FILES.FOLDER, { data: body });
  return res.data;
}

export async function updateFolderPublic(
  account_id: string,
  is_public: boolean,
  editor: FilesApiEditor | undefined,
  identifier: { name: string } | { folder_id: string }
): Promise<unknown> {
  const body: FilesFolderPublicBody = {
    account_id,
    is_public,
    ...editorBody(editor),
    ...identifier,
  };
  const res = await files.post(api.FILES.FOLDER_PUBLIC, body);
  return res.data;
}

export async function downloadFolder(
  account_id: string,
  folder: string,
  requester_id?: string
): Promise<Blob> {
  const res = await files.get(api.FILES.DOWNLOAD_FOLDER(account_id), {
    params: {
      folder,
      requester_id,
    },
    responseType: "blob",
  });
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

export async function getFolders(
  account_id: string,
  folder?: string | null,
  deleted?: boolean
): Promise<FilesFolderItem[]> {
  const res = await files.get(api.FILES.GET_FOLDERS(account_id), {
    params: { folder, deleted },
  });
  const data: FilesFoldersResponse = res.data;

  return (data.folders ?? []).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFolderNames(
  account_id: string,
  folder?: string | null,
  deleted?: boolean
): Promise<string[]> {
  const folders = await getFolders(account_id, folder, deleted);
  return folders.map((item) => item.name);
}
