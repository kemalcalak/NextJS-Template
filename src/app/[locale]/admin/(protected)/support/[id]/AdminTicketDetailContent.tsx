"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { TicketAdminControls } from "@/components/admin/TicketAdminControls";
import { MessageThread } from "@/components/support/MessageThread";
import { ReplyBox } from "@/components/support/ReplyBox";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/support/TicketStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminReplyTicket, useAdminTicket } from "@/hooks/api/use-support";
import { useTicketRealtime } from "@/hooks/use-support-realtime";
import { getLocaleFromPath, getLocalizedPath, ROUTES } from "@/lib/config/routes";

interface AdminTicketDetailContentProps {
  ticketId: string;
}

export function AdminTicketDetailContent({ ticketId }: AdminTicketDetailContentProps) {
  const { t } = useTranslation("support");
  const locale = getLocaleFromPath(usePathname());
  const { data: ticket, isLoading } = useAdminTicket(ticketId);
  const reply = useAdminReplyTicket(ticketId);

  // Live updates: customer replies and edits by other admins stream in.
  useTicketRealtime(ticketId, "admin");

  const backLink = (
    <Link
      href={getLocalizedPath(ROUTES.adminSupport, locale)}
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

  const customerName =
    [ticket.user.first_name, ticket.user.last_name].filter(Boolean).join(" ") || ticket.user.email;

  return (
    <div className="space-y-6">
      {backLink}

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
          <span className="text-sm text-muted-foreground">
            {`${t("admin.owner")}: ${customerName} (${ticket.user.email})`}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="border-border/50 bg-card/60">
            <CardContent className="p-0">
              <MessageThread
                messages={ticket.messages}
                viewerRole="admin"
                counterpartLabel={customerName}
              />
            </CardContent>
          </Card>
          <ReplyBox onSubmit={reply.mutateAsync} isPending={reply.isPending} />
        </div>

        <div className="space-y-4">
          <TicketAdminControls ticket={ticket} />
        </div>
      </div>
    </div>
  );
}
