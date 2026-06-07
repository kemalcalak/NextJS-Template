"use client";

import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/lib/format-date";
import type { SenderRole, SupportMessage } from "@/lib/types/support";
import { cn } from "@/lib/utils";

interface MessageThreadProps {
  messages: SupportMessage[];
  // Which side is viewing — their own messages align right. "user" on the
  // customer view, "admin" on the admin view, so one component serves both.
  viewerRole: SenderRole;
  // Label for the other party's messages. Defaults to the support team; the
  // admin view passes the customer's name instead.
  counterpartLabel?: string;
}

export function MessageThread({ messages, viewerRole, counterpartLabel }: MessageThreadProps) {
  const { t } = useTranslation("support");

  if (messages.length === 0) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">{t("detail.empty")}</div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => {
        const mine = message.sender_role === viewerRole;
        return (
          <div
            key={message.id}
            className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                mine ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              <p className="whitespace-pre-wrap wrap-break-word">{message.body}</p>
              {message.attachments.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.file.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={attachment.file.url}
                        alt={attachment.file.filename ?? ""}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <span className="px-1 text-[11px] text-muted-foreground">
              {`${mine ? t("detail.you") : (counterpartLabel ?? t("detail.supportTeam"))} · ${formatDateTime(message.created_at)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
