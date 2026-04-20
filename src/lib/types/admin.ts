import { SystemRole, type User } from "./user";

export { SystemRole };

export type ActivityType =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "execute"
  | "login"
  | "logout"
  | "export"
  | "invite";

export type ResourceType = "user" | "auth";

export type ActivityStatus = "success" | "failure";

// Strict JSON-value shape for audit-log `details`. The backend (FastAPI)
// stores it as `dict[str, JsonValue]`; keeping the client type symmetric means
// we never have to resort to `unknown` or `any` when inspecting rows.
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ActivityDetails = Record<string, JsonValue>;

// Admin list/detail rows. The backend returns the same shape as the existing
// /users/me User plus admin-only fields; reusing the User type keeps the
// client aligned with auth-store consumers.
export type AdminUser = User;

export interface AdminStats {
  users_total: number;
  users_active: number;
  users_verified: number;
  users_admins: number;
  activities_total: number;
}

export interface AdminUserListResponse {
  data: AdminUser[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdminUserListParams {
  skip?: number;
  limit?: number;
  search?: string;
  role?: SystemRole;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface AdminUserUpdatePayload {
  first_name?: string | null;
  last_name?: string | null;
  title?: string | null;
  email?: string;
  role?: SystemRole;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface AdminUserUpdateResponse {
  user: AdminUser;
  message: string;
}

export interface AdminActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  resource_type: ResourceType;
  resource_id: string | null;
  details: ActivityDetails;
  status: ActivityStatus;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminActivityListResponse {
  data: AdminActivity[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdminActivityListParams {
  skip?: number;
  limit?: number;
  user_id?: string;
  activity_type?: ActivityType;
  resource_type?: ResourceType;
  status?: ActivityStatus;
  date_from?: string;
  date_to?: string;
}
