import type { FilePublic } from "./file";

export enum SystemRole {
  ADMIN = "admin",
  USER = "user",
}

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  role: SystemRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
  deletion_scheduled_at: string | null;
  suspended_at: string | null;
  avatar_file?: FilePublic | null;
}

export interface UserUpdateResponse {
  user: User;
  message: string;
}

// Fields a user may change on their own account via PATCH /users/me. Distinct
// from `User` because the avatar is attached by id (`avatar_file_id`), whereas
// the response embeds the resolved `avatar_file` object.
export interface UpdateMePayload {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  title?: string | null;
  avatar_file_id?: string | null;
}
