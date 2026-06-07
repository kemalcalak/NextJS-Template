"use client";

import { createContext, useContext } from "react";

export interface SupportRealtimeContextValue {
  subscribeTicket: (ticketId: string) => void;
  unsubscribeTicket: (ticketId: string) => void;
}

export const SupportRealtimeContext = createContext<SupportRealtimeContextValue | null>(null);

// Access the shared support socket. Falls back to no-ops when the provider isn't
// mounted (e.g. isolated component tests) so consumers never need a guard.
export function useSupportRealtime(): SupportRealtimeContextValue {
  return (
    useContext(SupportRealtimeContext) ?? {
      subscribeTicket: () => undefined,
      unsubscribeTicket: () => undefined,
    }
  );
}
