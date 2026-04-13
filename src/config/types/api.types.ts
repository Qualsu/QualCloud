export interface ShrtlFileResponse {
  short_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  downloads: number;
  expires_in_seconds: number | null;
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