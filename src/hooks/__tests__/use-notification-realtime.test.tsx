import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useNotificationRealtime } from "@/hooks/use-notification-realtime";
import type { NotificationRealtimeEvent } from "@/lib/types/notification";
import { createTestQueryClient, createWrapper } from "@/test/test-utils";

// The hook wires the socket to the query cache; mock the socket factory so we
// can fire events by hand, and the auth store so we can flip the gate.
const { sockets, authState } = vi.hoisted(() => ({
  sockets: [] as {
    onEvent: (event: NotificationRealtimeEvent) => void;
    close: ReturnType<typeof vi.fn>;
  }[],
  authState: { isAuthenticated: true },
}));

vi.mock("@/lib/websocket/notification-socket", () => ({
  createNotificationSocket: (onEvent: (event: NotificationRealtimeEvent) => void) => {
    const socket = { onEvent, close: vi.fn() };
    sockets.push(socket);
    return socket;
  },
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) => selector(authState),
}));

afterEach(() => {
  sockets.length = 0;
  authState.isAuthenticated = true;
  vi.clearAllMocks();
});

const event: NotificationRealtimeEvent = {
  type: "notification_created",
  notification: {
    id: "n-1",
    type: "support_ticket_replied",
    data: { ticket_id: "t-1", subject: "Login fails" },
    read_at: null,
    created_at: "2026-01-01T00:00:00Z",
  },
};

describe("useNotificationRealtime", () => {
  it("opens a socket and invalidates the notification caches on an event", () => {
    const client = createTestQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    renderHook(
      () => {
        useNotificationRealtime();
      },
      { wrapper: createWrapper(client) },
    );

    expect(sockets).toHaveLength(1);
    sockets[0].onEvent(event);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["notifications"] });
  });

  it("closes the socket on unmount", () => {
    const { unmount } = renderHook(
      () => {
        useNotificationRealtime();
      },
      { wrapper: createWrapper() },
    );

    expect(sockets[0].close).not.toHaveBeenCalled();
    unmount();
    expect(sockets[0].close).toHaveBeenCalledTimes(1);
  });

  it("does not open a socket for guests", () => {
    authState.isAuthenticated = false;

    renderHook(
      () => {
        useNotificationRealtime();
      },
      { wrapper: createWrapper() },
    );

    expect(sockets).toHaveLength(0);
  });
});
