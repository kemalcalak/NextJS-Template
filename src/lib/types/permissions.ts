// RBAC permission keys (resource:action), mirrored 1:1 with the backend
// `Permission` enum. Superadmins implicitly hold every permission; plain admins
// hold the subset granted to them and delivered on `/users/me`. Keep this file
// the single source of truth for permission keys on the client.
export enum Permission {
  UsersRead = "users:read",
  UsersWrite = "users:write",
  UsersDelete = "users:delete",
  UsersSuspend = "users:suspend",
  UsersPasswordReset = "users:password_reset",
  UsersSessions = "users:sessions",
  FilesRead = "files:read",
  FilesDelete = "files:delete",
  SupportRead = "support:read",
  SupportWrite = "support:write",
  SupportUpdate = "support:update",
  ActivitiesRead = "activities:read",
  StatsRead = "stats:read",
  BroadcastRead = "broadcast:read",
  BroadcastWrite = "broadcast:write",
  SystemSettingsRead = "system_settings:read",
  SystemSettingsWrite = "system_settings:write",
}
