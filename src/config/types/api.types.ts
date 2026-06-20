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

export interface FilesLastEditor {
  username?: string | null;
  avatar_url?: string | null;
}

export interface FilesFolderItem {
  type: "folder";
  folder_id?: string;
  name: string;
  created_at: string;
  updated_at?: string | null;
  last_modified_at?: string | null;
  updated_by?: string | null;
  last_editor?: FilesLastEditor | null;
  is_public?: boolean;
  is_deleted?: boolean;
  deleted_at?: string | null;
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
  last_editor?: FilesLastEditor | null;
  file_url?: string;
  is_public?: boolean;
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

export interface FilesEditorBody {
  updated_by?: string | null;
  updated_by_avatar?: string | null;
}

export interface FilesMoveBody extends FilesEditorBody {
  file_id: string;
  folder?: string | null;
}

export interface FilesFavoriteBody extends FilesEditorBody {
  file_id: string;
}

export interface FilesTrashBody extends FilesEditorBody {
  file_id: string;
}

export interface FilesRestoreBody extends FilesEditorBody {
  file_id: string;
}

export interface FilesFolderCreateBody extends FilesEditorBody {
  account_id: string;
  name: string;
  parent?: string | null;
}

export interface FilesFolderRenameBody extends FilesEditorBody {
  account_id: string;
  old_name: string;
  new_name: string;
}

export interface FilesFolderMoveBody extends FilesEditorBody {
  account_id: string;
  name: string;
  parent?: string | null;
}

export interface FilesFolderTrashBody extends FilesEditorBody {
  account_id: string;
  name: string;
}

export interface FilesFolderRestoreBody extends FilesEditorBody {
  account_id: string;
  name: string;
}

export interface FilesFolderDeleteBody extends FilesEditorBody {
  account_id: string;
  name: string;
}

export interface FilesRenameBody extends FilesEditorBody {
  file_id: string;
  file_name: string;
}

export interface FilesPublicBody extends FilesEditorBody {
  file_id: string;
  is_public: boolean;
}

export interface FilesFolderPublicBody extends FilesEditorBody {
    account_id: string;
    name?: string;
    folder_id?: string;
    is_public: boolean;
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