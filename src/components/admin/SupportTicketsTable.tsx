"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { TicketPriorityBadge, TicketStatusBadge } from "@/components/support/TicketStatusBadge";
import { getLocaleFromPath, getLocalizedPath, ROUTES } from "@/lib/config/routes";
import { formatDate } from "@/lib/format-date";
import type { AdminTicketListItem } from "@/lib/types/support";

interface SupportTicketsTableProps {
  rows: AdminTicketListItem[];
  isLoading: boolean;
}

const requesterLabel = (ticket: AdminTicketListItem): string => {
  const name = [ticket.user.first_name, ticket.user.last_name].filter(Boolean).join(" ");
  return name || ticket.user.email;
};

export function SupportTicketsTable({ rows, isLoading }: SupportTicketsTableProps) {
  const { t } = useTranslation("support");
  const locale = getLocaleFromPath(usePathname());

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">{t("admin.columns.subject")}</th>
            <th className="px-4 py-3 font-medium">{t("admin.columns.requester")}</th>
            <th className="px-4 py-3 font-medium">{t("admin.columns.status")}</th>
            <th className="px-4 py-3 font-medium">{t("admin.columns.priority")}</th>
            <th className="px-4 py-3 text-center font-medium">{t("admin.columns.updated")}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((ticket) => {
            const href = getLocalizedPath(`${ROUTES.adminSupport}/${ticket.id}`, locale);
            return (
              <tr key={ticket.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3">
                  <Link href={href} className="flex items-center gap-2 font-medium">
                    <span className="truncate">{ticket.subject}</span>
                    {ticket.unread_count > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                        {ticket.unread_count}
                      </span>
                    ) : null}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{requesterLabel(ticket)}</td>
                <td className="px-4 py-3">
                  <TicketStatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3">
                  <TicketPriorityBadge priority={ticket.priority} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center text-xs text-muted-foreground">
                  {formatDate(ticket.last_message_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={href}
                    className="inline-flex text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                {isLoading ? t("admin.loading") : t("admin.empty")}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
