import { http, HttpResponse } from "msw";

import type { User } from "@/lib/types/user";

const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: "1",
  email: "john@example.com",
  first_name: "John",
  last_name: "Doe",
  role: "USER",
  is_active: true,
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  title: null,
  deactivated_at: null,
  deletion_scheduled_at: null,
  ...overrides,
});

export const handlers = [
  // Users handlers
  http.get("*/api/v1/users", () => {
    return HttpResponse.json([
      createMockUser({ id: "1", first_name: "John", last_name: "Doe" }),
      createMockUser({ id: "2", first_name: "Jane", last_name: "Doe", email: "jane@example.com" }),
    ]);
  }),

  // Auth handlers
  http.get("*/api/v1/users/me", () => {
    return HttpResponse.json(createMockUser());
  }),

  http.post("*/api/v1/auth/login", () => {
    return HttpResponse.json(
      {
        token_type: "bearer",
        user: createMockUser(),
        message: "success.auth.login",
      },
      {
        headers: {
          "Set-Cookie": "access_token=fake-cookie-jwt; HttpOnly; Path=/; SameSite=Lax",
        },
      },
    );
  }),

  http.post("*/api/v1/auth/register", () => {
    return HttpResponse.json(
      {
        success: true,
        message: "success.auth.register",
      },
      { status: 201 },
    );
  }),

  http.post("*/api/v1/auth/logout", () => {
    return HttpResponse.json(
      {
        success: true,
        message: "success.auth.logout",
      },
      {
        headers: {
          "Set-Cookie": "access_token=; HttpOnly; Path=/; Max-Age=0",
        },
      },
    );
  }),

  http.post("*/api/v1/auth/refresh", () => {
    return HttpResponse.json(
      { message: "success.auth.refresh", success: true },
      {
        headers: {
          "Set-Cookie": "access_token=new-fake-cookie-jwt; HttpOnly; Path=/; SameSite=Lax",
        },
      },
    );
  }),

  http.delete("*/api/v1/users/me", () => {
    return HttpResponse.json(
      { success: true, message: "success.account.deactivated" },
      {
        headers: {
          "Set-Cookie": "access_token=; HttpOnly; Path=/; Max-Age=0",
        },
      },
    );
  }),

  http.post("*/api/v1/users/me/reactivate", () => {
    return HttpResponse.json({
      success: true,
      message: "success.account.reactivated",
    });
  }),
];
