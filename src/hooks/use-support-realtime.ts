"use client";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { adminSupportKeys, supportKeys } from "@/hooks/api/use-support";
import type { SupportMessage, SupportTicketDetail } from "@/lib/types/support";
import { createReconnectingSocket } from "@/lib/websocket/support-socket";

type TicketScope = "user" | "admin";

// Append a message to a cached ticket detail, preserving any extra fields on
// the concrete (user vs admin) shape. Skips messages already present so the
// author's own optimistic reply isn't duplicated when its echo arrives.
const appendMessage = <T extends SupportTicketDetail>(
  ticket: T | undefined,
  message: SupportMessage,
): T | undefined => {
  if (!ticket) return ticket;
  if (ticket.messages.some((existing) => existing.id === message.id)) return ticket;
  return {
    ...ticket,
    messages: [...ticket.messages, message],
    last_message_at: message.created_at,
  };
};

// Stream realtime events for a single ticket into the React Query cache. `scope`
// selects the user or admin socket + cache key. Reconnects on drop; closes on
// unmount or when the ticket changes.
export const useTicketRealtime = (ticketId: string | undefined, scope: TicketScope): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!ticketId) return;

    const detailKey =
      scope === "admin" ? adminSupportKeys.detail(ticketId) : supportKeys.detail(ticketId);
    const path =
      scope === "admin"
        ? `/admin/support/tickets/${ticketId}/ws`
        : `/support/tickets/${ticketId}/ws`;

    const socket = createReconnectingSocket(path, {
      onEvent: (event) => {
        if (event.type === "message_created" && event.message) {
          const message = event.message;
          queryClient.setQueryData<SupportTicketDetail>(detailKey, (old) =>
            appendMessage(old, message),
          );
        } else if (event.type === "ticket_updated") {
          // Status / priority / assignment changed — reload the canonical row.
          void queryClient.invalidateQueries({ queryKey: detailKey });
        }
      },
    });

    return () => {
      socket.close();
    };
  }, [ticketId, scope, queryClient]);
};

// Stream the global admin feed: new tickets and status changes refresh the
// admin queue (list + unread badges) without a manual reload.
export const useAdminSupportFeed = (): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = createReconnectingSocket("/admin/support/ws", {
      onEvent: (event) => {
        if (event.type === "ticket_created" || event.type === "ticket_updated") {
          void queryClient.invalidateQueries({ queryKey: adminSupportKeys.listPrefix });
        }
      },
    });

    return () => {
      socket.close();
    };
  }, [queryClient]);
};
