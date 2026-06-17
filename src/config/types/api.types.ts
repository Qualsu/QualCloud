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

export interface FilesFileResponse {
  file_id: string;
  account_id: string;
  name: string;
  type: string;
  size?: number;
  folder?: string | null;
  is_favorite?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  url?: string;
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
}

export interface FilesFolderDeleteBody {
  account_id: string;
  name: string;
}

export interface FilesUserStatsResponse {
  total_files: number;
  total_size: number;
  storage_limit?: number;
}