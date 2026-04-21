"use client";

import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  isUsersRoleFilter,
  isUsersStatusFilter,
  isUsersVerifiedFilter,
  type UsersRoleFilter,
  type UsersStatusFilter,
  type UsersVerifiedFilter,
} from "@/components/admin/users-filters-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Re-export so existing import sites (e.g. UsersContent) keep working without
// reaching into `users-filters-config` directly. The constants are already
// available via the config module for callers that need the raw tuple/enum.
export type { UsersRoleFilter, UsersStatusFilter, UsersVerifiedFilter };

interface UsersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: UsersRoleFilter;
  onRoleChange: (value: UsersRoleFilter) => void;
  status: UsersStatusFilter;
  onStatusChange: (value: UsersStatusFilter) => void;
  verified: UsersVerifiedFilter;
  onVerifiedChange: (value: UsersVerifiedFilter) => void;
  onReset: () => void;
  hasFilters: boolean;
}

export function UsersFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  verified,
  onVerifiedChange,
  onReset,
  hasFilters,
}: UsersFiltersProps) {
  const { t } = useTranslation("admin");

  return (
    <Card className="border-border/50 bg-card/60">
      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-center">
        <div className="relative w-full md:flex-1 md:min-w-50">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("users.filters.searchPlaceholder")}
            value={search}
            onChange={(event) => {
              onSearchChange(event.target.value);
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:contents">
          <Select
            value={role}
            onValueChange={(value) => {
              if (isUsersRoleFilter(value)) onRoleChange(value);
            }}
          >
            <SelectTrigger
              aria-label={t("users.filters.role")}
              className="w-full md:w-fit md:min-w-35"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("users.filters.roleAny")}</SelectItem>
              <SelectItem value="admin">{t("users.role.admin")}</SelectItem>
              <SelectItem value="user">{t("users.role.user")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              if (isUsersStatusFilter(value)) onStatusChange(value);
            }}
          >
            <SelectTrigger
              aria-label={t("users.filters.status")}
              className="w-full md:w-fit md:min-w-35"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("users.filters.statusAny")}</SelectItem>
              <SelectItem value="active">{t("users.filters.statusActive")}</SelectItem>
              <SelectItem value="inactive">{t("users.filters.statusInactive")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={verified}
            onValueChange={(value) => {
              if (isUsersVerifiedFilter(value)) onVerifiedChange(value);
            }}
          >
            <SelectTrigger
              aria-label={t("users.filters.verified")}
              className="w-full md:w-fit md:min-w-35"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("users.filters.verifiedAny")}</SelectItem>
              <SelectItem value="yes">{t("users.filters.verifiedYes")}</SelectItem>
              <SelectItem value="no">{t("users.filters.verifiedNo")}</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="w-full md:w-auto"
            >
              <X className="h-4 w-4" />
              {t("users.filters.reset")}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
