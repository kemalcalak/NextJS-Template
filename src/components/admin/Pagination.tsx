"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PAGE_SIZE_OPTIONS } from "@/components/admin/pagination-config";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  total: number;
  skip: number;
  limit: number;
  onChange: (skip: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
}

export function AdminPagination({
  total,
  skip,
  limit,
  onChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const { t } = useTranslation("admin");
  const page = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(total, skip + limit);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{t("users.pagination.showing", { from, to, total })}</span>
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span>{t("users.pagination.rowsPerPage")}</span>
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                onPageSizeChange(Number(value));
              }}
            >
              <SelectTrigger size="sm" aria-label={t("users.pagination.rowsPerPage")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => {
            onChange(Math.max(0, skip - limit));
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("users.pagination.previous")}
        </Button>
        <span className="text-xs text-muted-foreground">
          {t("users.pagination.page", { page, total: totalPages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => {
            onChange(skip + limit);
          }}
        >
          {t("users.pagination.next")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
