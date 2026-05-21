// Public file metadata returned by the upload endpoint and embedded in user
// payloads (e.g. avatar_file). Mirrors the backend `FilePublic` schema — the
// internal Cloudinary `public_id` and uploader id are intentionally absent.
export interface FilePublic {
  id: string;
  url: string;
  content_type: string;
  size: number;
  filename: string | null;
  created_at: string;
}

// Admin file-management row. Exposes the internal fields (`public_id`,
// `uploaded_by_id`) that `FilePublic` hides, since admins audit raw uploads.
export interface AdminFileListItem {
  id: string;
  url: string;
  public_id: string;
  content_type: string;
  size: number;
  filename: string | null;
  uploaded_by_id: string | null;
  created_at: string;
}

export interface AdminFileListResponse {
  data: AdminFileListItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdminFileListParams {
  skip?: number;
  limit?: number;
  content_type?: string;
  uploaded_by?: string;
}
