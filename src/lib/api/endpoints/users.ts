import api from "../api";

import type { User, UserUpdateResponse } from "../../types/user";

export const usersApi = {
  getAll: (): Promise<User[]> => api.get<User[], User[]>("/users"),
  getById: (id: string): Promise<User> => api.get<User, User>(`/users/${id}`),
  create: (data: Omit<User, "id">): Promise<User> => api.post<User, User>("/users", data),
  update: (id: string, data: Partial<Omit<User, "id">>): Promise<User> =>
    api.put<User, User>(`/users/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/users/${id}`),
  updateMe: async (data: Partial<Omit<User, "id" | "role" | "email">>): Promise<User> => {
    const response = await api.patch<UserUpdateResponse, UserUpdateResponse>("/users/me", data);
    return response.user;
  },
  deactivateMe: (password: string, lang: string): Promise<{ success: boolean; message: string }> =>
    api.delete<{ success: boolean; message: string }, { success: boolean; message: string }>(
      "/users/me",
      { data: { password, lang } },
    ),
  reactivateMe: (): Promise<{ success: boolean; message: string }> =>
    api.post<{ success: boolean; message: string }, { success: boolean; message: string }>(
      "/users/me/reactivate",
    ),
};
