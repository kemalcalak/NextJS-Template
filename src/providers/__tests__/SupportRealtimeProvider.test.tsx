import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { adminSupportKeys, supportKeys } from "@/hooks/api/use-support";
import type { RealtimeEvent, SupportMessage, SupportTicketDetail } from "@/lib/types/support";
import { SystemRole } from "@/lib/types/user";
import { useSupportRealtime } from "@/providers/support-realtime-context";
import { SupportRealtimeProvider } from "@/providers/SupportRealtimeProvider";

// Capture every socket the provider opens so tests can drive its onEvent.
const { sockets } = vi.hoisted(() => ({
  sockets: [] as {
    path: string;
    onEvent: (e: RealtimeEvent) => void;
    subscribe: ReturnType<typeof vi.fn>;
    unsubscribe: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  }[],
}));

vi.mock("@/lib/websocket/support-socket", () => ({
  createReconnectingSocket: (path: string, opts: { onEvent: (e: RealtimeEvent) => void }) => {
    const socket = {
      path,
      onEvent: opts.onEvent,
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      close: vi.fn(),
    };
    sockets.push(socket);
    return socket;
  },
}));

// Mutable auth state the mocked store reads through the selector.
const { authState } = vi.hoisted(() => ({
  authState: { user: null as { id: string; role: string } | null, isAuthenticated: false },
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: (s: typeof authState) => unknown) => selector(authState),
}));

const message = (overrides: Partial<SupportMessage> = {}): SupportMessage => ({
  id: "m-1",
  sender_id: "admin-1",
  sender_role: "admin",
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

const makeClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });

const renderProvider = (role: string) => {
  authState.user = { id: "u-1", role };
  authState.isAuthenticated = true;
  const client = makeClient();
  render(
    <QueryClientProvider client={client}>
      <SupportRealtimeProvider>
        <div />
      </SupportRealtimeProvider>
    </QueryClientProvider>,
  );
  return { client, socket: sockets[0] };
};

beforeEach(() => {
  sockets.length = 0;
  authState.user = null;
  authState.isAuthenticated = false;
  vi.clearAllMocks();
});

describe("SupportRealtimeProvider", () => {
  it("does not open a socket when unauthenticated", () => {
    const client = makeClient();
    render(
      <QueryClientProvider client={client}>
        <SupportRealtimeProvider>
          <div />
        </SupportRealtimeProvider>
      </QueryClientProvider>,
    );
    expect(sockets).toHaveLength(0);
  });

  it("opens the user feed socket for a regular user", () => {
    const { socket } = renderProvider(SystemRole.USER);
    expect(socket.path).toBe("/support/ws");
  });

  it("opens the admin feed socket for an admin", () => {
    const { socket } = renderProvider(SystemRole.ADMIN);
    expect(socket.path).toBe("/admin/support/ws");
  });

  it("appends a message_created event into the detail cache", () => {
    const { client, socket } = renderProvider(SystemRole.USER);
    client.setQueryData(supportKeys.detail("t-1"), detail);

    socket.onEvent({
      type: "message_created",
      ticket_id: "t-1",
      message: message({ id: "m-1" }),
      ticket: null,
    });

    const cached = client.getQueryData<SupportTicketDetail>(supportKeys.detail("t-1"));
    expect(cached?.messages).toHaveLength(2);
  });

  it("dedupes a message already present", () => {
    const { client, socket } = renderProvider(SystemRole.USER);
    client.setQueryData(supportKeys.detail("t-1"), detail);

    socket.onEvent({
      type: "message_created",
      ticket_id: "t-1",
      message: message({ id: "m-0" }),
      ticket: null,
    });

    const cached = client.getQueryData<SupportTicketDetail>(supportKeys.detail("t-1"));
    expect(cached?.messages).toHaveLength(1);
  });

  it("invalidates the detail and list on ticket_updated (fixes stale detail on entry)", () => {
    const { client, socket } = renderProvider(SystemRole.USER);
    const spy = vi.spyOn(client, "invalidateQueries");

    socket.onEvent({ type: "ticket_updated", ticket_id: "t-1", message: null, ticket: null });

    expect(spy).toHaveBeenCalledWith({ queryKey: supportKeys.detail("t-1") });
    expect(spy).toHaveBeenCalledWith({ queryKey: supportKeys.myListPrefix });
  });

  it("uses the admin cache keys for an admin session", () => {
    const { client, socket } = renderProvider(SystemRole.ADMIN);
    const spy = vi.spyOn(client, "invalidateQueries");

    socket.onEvent({ type: "ticket_updated", ticket_id: "t-1", message: null, ticket: null });

    expect(spy).toHaveBeenCalledWith({ queryKey: adminSupportKeys.detail("t-1") });
    expect(spy).toHaveBeenCalledWith({ queryKey: adminSupportKeys.listPrefix });
  });

  it("exposes subscribeTicket/unsubscribeTicket that drive the socket", () => {
    authState.user = { id: "u-1", role: SystemRole.USER };
    authState.isAuthenticated = true;
    const client = makeClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>
        <SupportRealtimeProvider>{children}</SupportRealtimeProvider>
      </QueryClientProvider>
    );
    const { result } = renderHook(() => useSupportRealtime(), { wrapper });

    act(() => {
      result.current.subscribeTicket("t-9");
      result.current.unsubscribeTicket("t-9");
    });

    expect(sockets[0].subscribe).toHaveBeenCalledWith("ticket:t-9");
    expect(sockets[0].unsubscribe).toHaveBeenCalledWith("ticket:t-9");
  });
});
