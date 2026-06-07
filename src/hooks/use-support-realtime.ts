"use client";

import { useEffect } from "react";

import { useSupportRealtime } from "@/providers/support-realtime-context";

// Follow a single ticket's thread on the shared realtime socket while its detail
// is open. The provider routes incoming events into the React Query cache; this
// hook only manages the per-ticket subscription lifecycle (subscribe on mount,
// unsubscribe on unmount or when the ticket changes).
export const useTicketRealtime = (ticketId: string | undefined): void => {
  const { subscribeTicket, unsubscribeTicket } = useSupportRealtime();

  useEffect(() => {
    if (!ticketId) return;
    subscribeTicket(ticketId);
    return () => {
      unsubscribeTicket(ticketId);
    };
  }, [ticketId, subscribeTicket, unsubscribeTicket]);
};
