"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { MessageThread } from "@/components/support/MessageThread";
import { ReplyBox } from "@/components/support/ReplyBox";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/support/TicketStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCloseTicket, useMyTicket, useReplyTicket } from "@/hooks/api/use-support";
import { useTicketRealtime } from "@/hooks/use-support-realtime";
import { getLocaleFromPath, getLocalizedPath, ROUTES } from "@/lib/config/routes";

interface TicketDetailContentProps {
  ticketId: string;
}

export function TicketDetailContent({ ticketId }: TicketDetailContentProps) {
  const { t } = useTranslation("support");
  const locale = getLocaleFromPath(usePathname());
  const { data: ticket, isLoading } = useMyTicket(ticketId);
  const { mutate: closeTicket, isPending: isClosing } = useCloseTicket(ticketId);
  const reply = useReplyTicket(ticketId);

  // Live updates: admin replies and status changes stream into the cache.
  useTicketRealtime(ticketId, "user");

  const backLink = (
    <Link
      href={getLocalizedPath(ROUTES.support, locale)}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      {t("detail.back")}
    </Link>
  );

  if (isLoading && !ticket) {
    return (
      <div className="space-y-6">
        {backLink}
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        {backLink}
        <p className="text-center text-sm text-muted-foreground">{t("list.notFound")}</p>
      </div>
    );
  }

  const isClosed = ticket.status === "closed";

  return (
    <div className="space-y-6">
      {backLink}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
          <div className="flex items-center gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
        </div>
        {!isClosed ? (
          <Button
            variant="outline"
            loading={isClosing}
            onClick={() => {
              closeTicket();
            }}
          >
            {t("detail.close")}
          </Button>
        ) : null}
      </div>

      <Card className="border-border/50 bg-card/60">
        <CardContent className="p-0">
          <MessageThread messages={ticket.messages} viewerRole="user" />
        </CardContent>
      </Card>

      {isClosed ? (
        <p className="text-center text-sm text-muted-foreground">{t("detail.closedNotice")}</p>
      ) : (
        <ReplyBox onSubmit={reply.mutateAsync} isPending={reply.isPending} />
      )}
    </div>
  );
}
