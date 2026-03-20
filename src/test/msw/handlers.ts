import { http, HttpResponse } from "msw";

export const handlers = [
  // Users handlers
  http.get("*/api/v1/users", () => {
    return HttpResponse.json([
      { id: 1, first_name: "John", last_name: "Doe", email: "john@example.com" },
      { id: 2, first_name: "Jane", last_name: "Doe", email: "jane@example.com" },
    ]);
  }),

  // Auth handlers
  http.get("*/api/v1/users/me", () => {
    return HttpResponse.json({
      id: "1",
      email: "john@example.com",
      first_name: "John",
      last_name: "Doe",
    });
  }),

  http.post("*/api/v1/auth/login", () => {
    return HttpResponse.json({
      access_token: "fake-jwt-token",
      user: { id: "1", email: "john@example.com", first_name: "John", last_name: "Doe" },
    });
  }),

  http.post("*/api/v1/auth/register", () => {
    return HttpResponse.json({
      access_token: "fake-jwt-token",
      user: { id: "1", email: "john@example.com", first_name: "John", last_name: "Doe" },
    });
  }),

  http.post("*/api/v1/auth/logout", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  http.post("*/api/v1/auth/refresh", () => {
    return HttpResponse.json({
      access_token: "new-fake-jwt-token",
    });
  }),
];
