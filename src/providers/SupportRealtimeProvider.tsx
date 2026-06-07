"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { adminSupportKeys, supportKeys } from "@/hooks/api/use-support";
import type { SupportMessage, SupportTicketDetail } from "@/lib/types/support";
import { SystemRole } from "@/lib/types/user";
import { createReconnectingSocket, type SupportSocket } from "@/lib/websocket/support-socket";
import { SupportRealtimeContext } from "@/providers/support-realtime-context";
import { useAuthStore } from "@/stores/auth.store";

// Append a streamed message to a cached ticket detail, skipping duplicates so an
// author's own optimistic echo isn't doubled.
const appendMessage = (
  ticket: SupportTicketDetail | undefined,
  message: SupportMessage,
): SupportTicketDetail | undefined => {
  if (!ticket) return ticket;
  if (ticket.messages.some((existing) => existing.id === message.id)) return ticket;
  return {
    ...ticket,
    messages: [...ticket.messages, message],
    last_message_at: message.created_at,
  };
};

// Holds the one support WebSocket for the whole authenticated session. Opened
// after login (role decides the endpoint + cache keys), it auto-receives the
// caller's feed and multiplexes per-ticket subscriptions on demand. All events
// are routed into the React Query cache here, so screens only declare which
// ticket they're viewing — they never own a socket.
export function SupportRealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const socketRef = useRef<SupportSocket | null>(null);

  const userId = user?.id;
  const isAdmin = user?.role === SystemRole.ADMIN;

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const path = isAdmin ? "/admin/support/ws" : "/support/ws";
    const detailKey = (id: string) =>
      isAdmin ? adminSupportKeys.detail(id) : supportKeys.detail(id);
    const listPrefix = isAdmin ? adminSupportKeys.listPrefix : supportKeys.myListPrefix;

    const socket = createReconnectingSocket(path, {
      onEvent: (event) => {
        if (event.type === "message_created" && event.message) {
          const message = event.message;
          queryClient.setQueryData<SupportTicketDetail>(detailKey(event.ticket_id), (old) =>
            appendMessage(old, message),
          );
          void queryClient.invalidateQueries({ queryKey: listPrefix });
        } else if (event.type === "ticket_updated") {
          // Refresh both the open thread and the list (status / unread / order).
          void queryClient.invalidateQueries({ queryKey: detailKey(event.ticket_id) });
          void queryClient.invalidateQueries({ queryKey: listPrefix });
        } else if (event.type === "ticket_created") {
          void queryClient.invalidateQueries({ queryKey: listPrefix });
        }
      },
    });
    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [isAuthenticated, userId, isAdmin, queryClient]);

  const subscribeTicket = useCallback((ticketId: string) => {
    socketRef.current?.subscribe(`ticket:${ticketId}`);
  }, []);
  const unsubscribeTicket = useCallback((ticketId: string) => {
    socketRef.current?.unsubscribe(`ticket:${ticketId}`);
  }, []);

  const value = useMemo(
    () => ({ subscribeTicket, unsubscribeTicket }),
    [subscribeTicket, unsubscribeTicket],
  );

  return (
    <SupportRealtimeContext.Provider value={value}>{children}</SupportRealtimeContext.Provider>
  );
}
