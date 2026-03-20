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
  is_deleted: false,
  title: null,
  deleted_at: null,
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
        token_type: "bearer",
        user: createMockUser(),
        message: "success.auth.register",
      },
      {
        headers: {
          "Set-Cookie": "access_token=fake-cookie-jwt; HttpOnly; Path=/; SameSite=Lax",
        },
      },
    );
  }),

  http.post("*/api/v1/auth/logout", () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        "Set-Cookie": "access_token=; HttpOnly; Path=/; Max-Age=0",
      },
    });
  }),

  http.post("*/api/v1/auth/refresh", () => {
    return HttpResponse.json(
      { message: "Token refreshed", success: true },
      {
        headers: {
          "Set-Cookie": "access_token=new-fake-cookie-jwt; HttpOnly; Path=/; SameSite=Lax",
        },
      },
    );
  }),
];
