import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import {
  notificationKeys,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/api/use-notifications";
import type { NotificationItem } from "@/lib/types/notification";
import { server } from "@/test/msw/server";
import { createTestQueryClient, createWrapper } from "@/test/test-utils";

// --- Fixtures ---------------------------------------------------------------

const mockNotification: NotificationItem = {
  id: "n-1",
  type: "support_ticket_replied",
  data: { ticket_id: "t-1", subject: "Login fails" },
  read_at: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("useNotifications", () => {
  it("fetches the caller's notifications with total", async () => {
    server.use(
      http.get("*/api/v1/notifications", () =>
        HttpResponse.json({ data: [mockNotification], total: 1, skip: 0, limit: 10 }),
      ),
    );
    const { result } = renderHook(() => useNotifications({ limit: 10 }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.data[0].id).toBe("n-1");
    expect(result.current.data?.total).toBe(1);
  });

  it("forwards pagination and the unread filter to the query string", async () => {
    let requestedUrl = "";
    server.use(
      http.get("*/api/v1/notifications", ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({ data: [], total: 0, skip: 5, limit: 10 });
      }),
    );
    const { result } = renderHook(
      () => useNotifications({ skip: 5, limit: 10, unread_only: true }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(requestedUrl).toContain("skip=5");
    expect(requestedUrl).toContain("limit=10");
    expect(requestedUrl).toContain("unread_only=true");
  });
});

describe("useUnreadCount", () => {
  it("fetches the badge counter", async () => {
    server.use(
      http.get("*/api/v1/notifications/unread-count", () => HttpResponse.json({ unread_count: 3 })),
    );
    const { result } = renderHook(() => useUnreadCount(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.unread_count).toBe(3);
  });
});

describe("useMarkNotificationRead", () => {
  it("posts the read mark and invalidates every notification cache", async () => {
    server.use(
      http.post("*/api/v1/notifications/n-1/read", () =>
        HttpResponse.json({
          data: { ...mockNotification, read_at: "2026-01-02T00:00:00Z" },
          message: "success.notification.read",
        }),
      ),
    );
    const client = createTestQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useMarkNotificationRead(), {
      wrapper: createWrapper(client),
    });
    result.current.mutate("n-1");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.data.read_at).toBe("2026-01-02T00:00:00Z");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: notificationKeys.all });
  });
});

describe("useMarkAllNotificationsRead", () => {
  it("posts read-all and invalidates every notification cache", async () => {
    server.use(
      http.post("*/api/v1/notifications/read-all", () =>
        HttpResponse.json({ updated: 2, message: "success.notification.all_read" }),
      ),
    );
    const client = createTestQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useMarkAllNotificationsRead(), {
      wrapper: createWrapper(client),
    });
    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.updated).toBe(2);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: notificationKeys.all });
  });
});
