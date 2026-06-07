import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { adminSupportKeys, supportKeys } from "@/hooks/api/use-support";
import { useAdminSupportFeed, useTicketRealtime } from "@/hooks/use-support-realtime";
import type { RealtimeEvent, SupportMessage, SupportTicketDetail } from "@/lib/types/support";

// Capture every socket the hooks open so a test can drive its onEvent callback
// and assert the socket is closed on unmount. `vi.hoisted` lets the mock factory
// (hoisted above imports) share this registry with the test body.
const { sockets } = vi.hoisted(() => ({
  sockets: [] as { path: string; onEvent: (e: RealtimeEvent) => void; close: () => void }[],
}));

vi.mock("@/lib/websocket/support-socket", () => ({
  createReconnectingSocket: (path: string, opts: { onEvent: (e: RealtimeEvent) => void }) => {
    const close = vi.fn();
    sockets.push({ path, onEvent: opts.onEvent, close });
    return { close };
  },
}));

const message = (overrides: Partial<SupportMessage> = {}): SupportMessage => ({
  id: "m-1",
  sender_id: "u-1",
  sender_role: "user",
  body: "hi",
  read_at: null,
  created_at: "2026-01-02T00:00:00Z",
  attachments: [],
  ...overrides,
});

const detail: SupportTicketDetail = {
  id: "t-1",
  subject: "Cannot log in",
  status: "open",
  priority: "normal",
  last_message_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  closed_at: null,
  messages: [message({ id: "m-0", created_at: "2026-01-01T00:00:00Z" })],
};

// gcTime: Infinity keeps observer-less query data alive long enough to assert.
const makeClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });

const wrapper = (client: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

beforeEach(() => {
  sockets.length = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useTicketRealtime", () => {
  it("opens the user socket on the ticket path", () => {
    const client = makeClient();
    renderHook(
      () => {
        useTicketRealtime("t-1", "user");
      },
      { wrapper: wrapper(client) },
    );
    expect(sockets).toHaveLength(1);
    expect(sockets[0].path).toBe("/support/tickets/t-1/ws");
  });

  it("opens the admin socket on the admin path", () => {
    const client = makeClient();
    renderHook(
      () => {
        useTicketRealtime("t-1", "admin");
      },
      { wrapper: wrapper(client) },
    );
    expect(sockets[0].path).toBe("/admin/support/tickets/t-1/ws");
  });

  it("appends a message_created event into the detail cache", () => {
    const client = makeClient();
    client.setQueryData(supportKeys.detail("t-1"), detail);
    renderHook(
      () => {
        useTicketRealtime("t-1", "user");
      },
      { wrapper: wrapper(client) },
    );

    const incoming = message({ id: "m-1", body: "an update" });
    sockets[0].onEvent({
      type: "message_created",
      ticket_id: "t-1",
      message: incoming,
      ticket: null,
    });

    const cached = client.getQueryData<SupportTicketDetail>(supportKeys.detail("t-1"));
    expect(cached?.messages).toHaveLength(2);
    expect(cached?.messages[1].id).toBe("m-1");
    expect(cached?.last_message_at).toBe(incoming.created_at);
  });

  it("dedupes a message already present (optimistic echo)", () => {
    const client = makeClient();
    client.setQueryData(supportKeys.detail("t-1"), detail);
    renderHook(
      () => {
        useTicketRealtime("t-1", "user");
      },
      { wrapper: wrapper(client) },
    );

    // Same id as the seeded message — must not be appended twice.
    sockets[0].onEvent({
      type: "message_created",
      ticket_id: "t-1",
      message: message({ id: "m-0" }),
      ticket: null,
    });

    const cached = client.getQueryData<SupportTicketDetail>(supportKeys.detail("t-1"));
    expect(cached?.messages).toHaveLength(1);
  });

  it("invalidates the detail query on a ticket_updated event", () => {
    const client = makeClient();
    const spy = vi.spyOn(client, "invalidateQueries");
    renderHook(
      () => {
        useTicketRealtime("t-1", "admin");
      },
      { wrapper: wrapper(client) },
    );

    sockets[0].onEvent({ type: "ticket_updated", ticket_id: "t-1", message: null, ticket: null });

    expect(spy).toHaveBeenCalledWith({ queryKey: adminSupportKeys.detail("t-1") });
  });

  it("does nothing without a ticket id and closes on unmount", () => {
    const client = makeClient();
    const { unmount, rerender } = renderHook(
      ({ id }: { id: string | undefined }) => {
        useTicketRealtime(id, "user");
      },
      { wrapper: wrapper(client), initialProps: { id: undefined } },
    );
    expect(sockets).toHaveLength(0);

    rerender({ id: "t-1" });
    expect(sockets).toHaveLength(1);

    unmount();
    expect(sockets[0].close).toHaveBeenCalledTimes(1);
  });
});

describe("useAdminSupportFeed", () => {
  it("opens the global admin feed socket", () => {
    const client = makeClient();
    renderHook(
      () => {
        useAdminSupportFeed();
      },
      { wrapper: wrapper(client) },
    );
    expect(sockets[0].path).toBe("/admin/support/ws");
  });

  it("invalidates the admin list on ticket_created and ticket_updated", () => {
    const client = makeClient();
    const spy = vi.spyOn(client, "invalidateQueries");
    renderHook(
      () => {
        useAdminSupportFeed();
      },
      { wrapper: wrapper(client) },
    );

    sockets[0].onEvent({ type: "ticket_created", ticket_id: "t-9", message: null, ticket: null });
    sockets[0].onEvent({ type: "ticket_updated", ticket_id: "t-9", message: null, ticket: null });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith({ queryKey: adminSupportKeys.listPrefix });
  });

  it("ignores message_created on the global feed", () => {
    const client = makeClient();
    const spy = vi.spyOn(client, "invalidateQueries");
    renderHook(
      () => {
        useAdminSupportFeed();
      },
      { wrapper: wrapper(client) },
    );

    sockets[0].onEvent({
      type: "message_created",
      ticket_id: "t-9",
      message: message(),
      ticket: null,
    });

    expect(spy).not.toHaveBeenCalled();
  });
});
