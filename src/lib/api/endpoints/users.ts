import api from "../api";

import type { User, UserUpdateResponse } from "../../types/user";

export const usersApi = {
  getAll: (): Promise<User[]> => api.get<User[], User[]>("/users"),
  getById: (id: number): Promise<User> => api.get<User, User>(`/users/${id}`),
  create: (data: Omit<User, "id">): Promise<User> => api.post<User, User>("/users", data),
  update: (id: number, data: Partial<Omit<User, "id">>): Promise<User> =>
    api.put<User, User>(`/users/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/users/${id}`),
  updateMe: async (data: Partial<Omit<User, "id" | "role" | "email">>): Promise<User> => {
    const response = await api.patch<UserUpdateResponse, UserUpdateResponse>("/users/me", data);
    return response.user;
  },
  deleteMe: (password: string): Promise<void> => api.delete("/users/me", { data: { password } }),
};
