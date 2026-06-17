export interface ShrtlFileResponse {
  short_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  downloads: number;
  expires_in_seconds: number | null;
  file_url?: string;
}

export interface NotterFileResponse {
  _id: string;
  userid: string;
  documentid: string;
  filename: string;
  username: string;
  avatar: string;
  type: string;
  fileid: string;
  created: string;
}

export interface FilesFolderItem {
  type: "folder";
  name: string;
  created_at: string;
  updated_at?: string | null;
  updated_by?: string | null;
}

export interface FilesFileResponse {
  type?: "file";
  file_id: string;
  account_id?: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  folder?: string | null;
  is_favorite?: boolean;
  is_deleted?: boolean;
  deleted_at?: string | null;
  uploaded_at?: string;
  updated_at?: string | null;
  updated_by?: string | null;
  file_url?: string;
}

export type FilesListItem = FilesFileResponse | FilesFolderItem;

export interface FilesListResponse {
  account_id?: string;
  folder?: string | null;
  items?: FilesListItem[];
  files?: FilesFileResponse[];
  folders?: FilesFolderItem[];
}

export interface FilesFoldersResponse {
  account_id?: string;
  folders: FilesFolderItem[];
}

export interface FilesUploadResponse {
  file_id: string;
  name?: string;
  size?: number;
  type?: string;
  url?: string;
}

export interface FilesMoveBody {
  file_id: string;
  folder?: string | null;
}

export interface FilesFavoriteBody {
  file_id: string;
}

export interface FilesTrashBody {
  file_id: string;
}

export interface FilesRestoreBody {
  file_id: string;
}

export interface FilesFolderCreateBody {
  account_id: string;
  name: string;
  parent?: string | null;
}

export interface FilesFolderRenameBody {
  account_id: string;
  old_name: string;
  new_name: string;
}

export interface FilesFolderMoveBody {
  account_id: string;
  name: string;
  parent?: string | null;
}

export interface FilesFolderDeleteBody {
  account_id: string;
  name: string;
}

export interface FilesRenameBody {
  file_id: string;
  file_name: string;
}

export interface FilesUserStatsResponse {
  account_id: string;
  used_size: number;
  limit_size: number;
  remaining_size: number;
  used_percent: number;
  total_files: number;
  total_favorites: number;
  trash_size: number;
  trash_files: number;
  trash_empty_in_seconds: number;
  trash_empty_in_days: number;
}