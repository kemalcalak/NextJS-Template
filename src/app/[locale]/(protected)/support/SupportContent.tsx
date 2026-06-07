"use client";

import { useMemo, useState } from "react";

import { Segmented } from "antd";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AdminPagination } from "@/components/admin/Pagination";
import { DEFAULT_PAGE_SIZE } from "@/components/admin/pagination-config";
import { NewTicketModal } from "@/components/support/NewTicketModal";
import { TicketList } from "@/components/support/TicketList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyTickets } from "@/hooks/api/use-support";
import { TICKET_STATUSES, type TicketStatus } from "@/lib/types/support";

type StatusFilter = TicketStatus | "all";

export function SupportContent() {
  const { t } = useTranslation("support");

  const [status, setStatus] = useState<StatusFilter>("all");
  const [skip, setSkip] = useState(0);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [modalOpen, setModalOpen] = useState(false);

  const params = useMemo(
    () => ({ skip, limit: pageSize, status: status === "all" ? undefined : status }),
    [skip, pageSize, status],
  );

  const { data, isLoading, isFetching } = useMyTickets(params);

  const statusOptions = [
    { label: t("admin.filters.all"), value: "all" },
    ...TICKET_STATUSES.map((value) => ({ label: t(`status.${value}`), value })),
  ];

  return (
    <div className="mx-auto w-full max-w-480 space-y-6 p-4 sm:p-6 lg:p-8 xl:p-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("list.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("list.subtitle")}</p>
        </div>
        <Button
          onClick={() => {
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("list.newTicket")}
        </Button>
      </div>

      {/* Scrolls instead of cramming the five filters on narrow screens. */}
      <div className="-mx-1 overflow-x-auto px-1">
        <Segmented
          size="large"
          options={statusOptions}
          value={status}
          onChange={(value) => {
            setStatus(value as StatusFilter);
            setSkip(0);
          }}
        />
      </div>

      <Card className="border-border/50 bg-card/60">
        <CardContent className="p-0">
          <TicketList rows={data?.data ?? []} isLoading={isLoading && !data} />
          {data ? (
            <div
              className="px-4 pb-4 pt-0"
              aria-live="polite"
              aria-busy={isFetching ? "true" : "false"}
            >
              <AdminPagination
                total={data.total}
                skip={data.skip}
                limit={data.limit}
                onChange={setSkip}
                onPageSizeChange={(next) => {
                  setPageSize(next);
                  setSkip(0);
                }}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <NewTicketModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
