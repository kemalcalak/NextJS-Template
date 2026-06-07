import { env } from "@/env";
import type { RealtimeEvent } from "@/lib/types/support";

// Backoff bounds for reconnection. We start at 1s and double up to 15s.
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 15000;
// Consecutive failed connection attempts (never reached `onopen`) after which
// we stop retrying. This is the auth-failure / server-down escape hatch: a
// rejected handshake never opens, so it trips this cap instead of looping
// forever. A successful open resets the counter, so flaky links keep retrying.
const MAX_CONSECUTIVE_FAILURES = 6;

// Resolve the WebSocket origin: explicit override, else derive from the API
// origin (http -> ws, https -> wss), else the current page origin.
const wsOrigin = (): string => {
  if (env.NEXT_PUBLIC_WS_URL) return env.NEXT_PUBLIC_WS_URL.replace(/\/$/, "");
  const httpOrigin =
    env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return httpOrigin.replace(/^http/, "ws").replace(/\/$/, "");
};

// Build a full ws(s):// URL for a backend path like "/support/tickets/<id>/ws".
export const buildWsUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${wsOrigin()}${env.NEXT_PUBLIC_API_PREFIX}${normalizedPath}`;
};

export interface SupportSocket {
  close: () => void;
  // Follow / stop following a multiplexed topic (e.g. `ticket:{id}`). The set of
  // active subscriptions is replayed automatically after a reconnect.
  subscribe: (topic: string) => void;
  unsubscribe: (topic: string) => void;
}

interface SocketOptions {
  onEvent: (event: RealtimeEvent) => void;
}

// Open a self-healing WebSocket to `path`. Cookies on the backend origin ride
// the handshake automatically, so no token is passed here. The socket is
// multiplexed: it auto-receives its feed and can `subscribe()` to ticket
// threads on demand. Returns a handle whose `close()` stops the socket and
// cancels any pending reconnect.
export const createReconnectingSocket = (
  path: string,
  { onEvent }: SocketOptions,
): SupportSocket => {
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let failures = 0;
  let closedByCaller = false;
  // Topics the caller wants to follow; replayed on every (re)connect so a drop
  // doesn't silently lose the ticket thread the user is viewing.
  const subscriptions = new Set<string>();

  const sendCommand = (action: "subscribe" | "unsubscribe", topic: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action, topic }));
    }
  };

  const scheduleReconnect = () => {
    if (closedByCaller || failures >= MAX_CONSECUTIVE_FAILURES) return;
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** failures, RECONNECT_MAX_MS);
    reconnectTimer = setTimeout(connect, delay);
  };

  function connect() {
    if (closedByCaller || typeof window === "undefined") return;
    socket = new WebSocket(buildWsUrl(path));

    socket.onopen = () => {
      // A live connection clears the failure streak so later drops still retry.
      failures = 0;
      // Replay subscriptions so a reconnect restores the followed ticket.
      for (const topic of subscriptions) {
        sendCommand("subscribe", topic);
      }
    };

    socket.onmessage = (message) => {
      try {
        onEvent(JSON.parse(message.data as string) as RealtimeEvent);
      } catch {
        // Ignore frames that aren't valid event JSON.
      }
    };

    socket.onclose = () => {
      failures += 1;
      scheduleReconnect();
    };

    // Let onclose drive reconnection; closing here avoids a double-trigger.
    socket.onerror = () => {
      socket?.close();
    };
  }

  connect();

  return {
    close: () => {
      closedByCaller = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    },
    subscribe: (topic: string) => {
      subscriptions.add(topic);
      sendCommand("subscribe", topic);
    },
    unsubscribe: (topic: string) => {
      subscriptions.delete(topic);
      sendCommand("unsubscribe", topic);
    },
  };
};
