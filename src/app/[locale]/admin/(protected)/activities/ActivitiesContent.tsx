"use client";

import { useMemo, useState } from "react";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ActivityTable } from "@/components/admin/ActivityTable";
import { AdminPagination } from "@/components/admin/Pagination";
import { DEFAULT_PAGE_SIZE } from "@/components/admin/pagination-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminActivities } from "@/hooks/api/use-admin";
import type {
  ActivityStatus,
  ActivityType,
  AdminActivityListParams,
  ResourceType,
} from "@/lib/types/admin";

// Option arrays mirror the FastAPI StrEnums in
// app/schemas/user_activity.py (ActivityType, ResourceType, ActivityStatus).
// Kept as readonly const-tuples so changes to the backend enum surface as
// TypeScript errors rather than silent mismatches.
const ACTIVITY_TYPES = [
  "create",
  "read",
  "update",
  "delete",
  "execute",
  "login",
  "logout",
  "export",
  "invite",
] as const satisfies readonly ActivityType[];

const RESOURCE_TYPES = ["user", "auth"] as const satisfies readonly ResourceType[];
const STATUS_OPTIONS = ["success", "failure"] as const satisfies readonly ActivityStatus[];

type TypeFilter = "all" | ActivityType;
type ResourceFilter = "all" | ResourceType;
type StatusFilter = "all" | ActivityStatus;

const isTypeFilter = (value: string): value is TypeFilter =>
  value === "all" || (ACTIVITY_TYPES as readonly string[]).includes(value);
const isResourceFilter = (value: string): value is ResourceFilter =>
  value === "all" || (RESOURCE_TYPES as readonly string[]).includes(value);
const isStatusFilter = (value: string): value is StatusFilter =>
  value === "all" || (STATUS_OPTIONS as readonly string[]).includes(value);

export function ActivitiesContent() {
  const { t } = useTranslation("admin");
  const [type, setType] = useState<TypeFilter>("all");
  const [resource, setResource] = useState<ResourceFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [skip, setSkip] = useState(0);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const params = useMemo<AdminActivityListParams>(
    () => ({
      skip,
      limit: pageSize,
      activity_type: type === "all" ? undefined : type,
      resource_type: resource === "all" ? undefined : resource,
      status: status === "all" ? undefined : status,
    }),
    [skip, pageSize, type, resource, status],
  );

  const { data, isLoading } = useAdminActivities(params);

  const resetFilters = () => {
    setType("all");
    setResource("all");
    setStatus("all");
    setSkip(0);
  };

  const hasFilters = type !== "all" || resource !== "all" || status !== "all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {t("activities.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("activities.subtitle")}</p>
      </div>

      <Card className="border-border/50 bg-card/60">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-center">
          <div className="grid grid-cols-2 gap-2 md:contents">
            <Select
              value={type}
              onValueChange={(value) => {
                if (!isTypeFilter(value)) return;
                setType(value);
                setSkip(0);
              }}
            >
              <SelectTrigger
                aria-label={t("activities.filters.type")}
                className="w-full md:w-fit md:min-w-35"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("activities.filters.typeAny")}</SelectItem>
                {ACTIVITY_TYPES.map((v) => (
                  <SelectItem key={v} value={v}>
                    {t(`activities.type.${v}` as const)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={resource}
              onValueChange={(value) => {
                if (!isResourceFilter(value)) return;
                setResource(value);
                setSkip(0);
              }}
            >
              <SelectTrigger
                aria-label={t("activities.filters.resource")}
                className="w-full md:w-fit md:min-w-35"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("activities.filters.resourceAny")}</SelectItem>
                {RESOURCE_TYPES.map((v) => (
                  <SelectItem key={v} value={v}>
                    {t(`activities.resource.${v}` as const)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => {
                if (!isStatusFilter(value)) return;
                setStatus(value);
                setSkip(0);
              }}
            >
              <SelectTrigger
                aria-label={t("activities.filters.status")}
                className="w-full md:w-fit md:min-w-35"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("activities.filters.statusAny")}</SelectItem>
                {STATUS_OPTIONS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {t(`activities.status.${v}` as const)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="w-full md:w-auto"
              >
                <X className="h-4 w-4" />
                {t("activities.filters.reset")}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <ActivityTable rows={data?.data ?? []} isLoading={isLoading} />

      {data ? (
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
      ) : null}
    </div>
  );
}
