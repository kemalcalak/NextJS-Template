import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "@/lib/api/endpoints/users";
import type { User } from "@/lib/types/user";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  detail: (id: number) => ["users", id] as const,
};

// Get all users
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => usersApi.getAll(),
  });
};

// Get single user
export const useUser = (id: number | undefined) => {
  return useQuery({
    queryKey: id ? userKeys.detail(id) : ["users", "invalid"],
    queryFn: () => {
      if (!id) throw new Error("User ID is required");
      return usersApi.getById(id);
    },
    enabled: typeof id === "number",
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<User, "id">) => usersApi.create(data),
    onSuccess: () => {
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Update user mutation
interface UpdateUserParams {
  id: number;
  data: Partial<Omit<User, "id">>;
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: UpdateUserParams) => usersApi.update(id, data),
    onSuccess: (data) => {
      // Update both detail and list cache
      queryClient.invalidateQueries({ queryKey: userKeys.detail(Number(data.id)) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Update current user mutation
export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Omit<User, "id" | "role" | "email">>) => usersApi.updateMe(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(Number(data.id)) });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
};

// Delete own account mutation
export const useDeleteMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => usersApi.deleteMe(password),
    onSuccess: () => {
      // Typically followed by logout or redirect
      queryClient.clear();
    },
  });
};
