export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
}

export interface UserUpdateResponse {
  user: User;
  message: string;
}
