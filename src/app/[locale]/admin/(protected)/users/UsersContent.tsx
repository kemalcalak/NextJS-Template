"use client";

import { useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { AdminPagination } from "@/components/admin/Pagination";
import { DEFAULT_PAGE_SIZE } from "@/components/admin/pagination-config";
import { UserActionDialogs, type UserActionKind } from "@/components/admin/UserActionDialogs";
import {
  UsersFilters,
  type UsersRoleFilter,
  type UsersStatusFilter,
  type UsersVerifiedFilter,
} from "@/components/admin/UsersFilters";
import { UsersTable } from "@/components/admin/UsersTable";
import { Card, CardContent } from "@/components/ui/card";
import {
  useActivateAdminUser,
  useAdminUsers,
  useDeactivateAdminUser,
  useDeleteAdminUser,
  useResetAdminUserPassword,
} from "@/hooks/api/use-admin";
import { useDebounce } from "@/hooks/use-debounce";
import type { AdminUser } from "@/lib/types/admin";
import { useAuthStore } from "@/stores/auth.store";

interface Pending {
  kind: UserActionKind;
  user: AdminUser | null;
}

export function UsersContent() {
  const { t, i18n } = useTranslation("admin");
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);

  const [searchInput, setSearchInput] = useState("");
  const [role, setRole] = useState<UsersRoleFilter>("all");
  const [status, setStatus] = useState<UsersStatusFilter>("all");
  const [verified, setVerified] = useState<UsersVerifiedFilter>("all");
  const [skip, setSkip] = useState(0);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [pending, setPending] = useState<Pending>({ kind: null, user: null });

  const search = useDebounce(searchInput, 250);

  const params = useMemo(
    () => ({
      skip,
      limit: pageSize,
      search: search.trim() || undefined,
      role: role === "all" ? undefined : role,
      is_active: status === "all" ? undefined : status === "active",
      is_verified: verified === "all" ? undefined : verified === "yes",
    }),
    [skip, pageSize, search, role, status, verified],
  );

  const { data, isLoading, isFetching } = useAdminUsers(params);
  const activate = useActivateAdminUser();
  const deactivate = useDeactivateAdminUser();
  const remove = useDeleteAdminUser();
  const resetPassword = useResetAdminUserPassword();

  const hasFilters = searchInput !== "" || role !== "all" || status !== "all" || verified !== "all";

  const resetFilters = () => {
    setSearchInput("");
    setRole("all");
    setStatus("all");
    setVerified("all");
    setSkip(0);
  };

  const setAction = (kind: NonNullable<UserActionKind>, user: AdminUser) => {
    setPending({ kind, user });
  };

  const clearAction = () => {
    setPending({ kind: null, user: null });
  };

  const runAction = () => {
    const { kind, user } = pending;
    if (!kind || !user) return;
    const onSettled = () => {
      clearAction();
    };
    if (kind === "activate") activate.mutate(user.id, { onSettled });
    else if (kind === "deactivate") deactivate.mutate(user.id, { onSettled });
    else if (kind === "delete") remove.mutate(user.id, { onSettled });
    else resetPassword.mutate({ id: user.id, lang: i18n.language }, { onSettled });
  };

  const isActionLoading =
    activate.isPending || deactivate.isPending || remove.isPending || resetPassword.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("users.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("users.subtitle")}</p>
      </div>

      <UsersFilters
        search={searchInput}
        onSearchChange={(value) => {
          setSearchInput(value);
          setSkip(0);
        }}
        role={role}
        onRoleChange={(value) => {
          setRole(value);
          setSkip(0);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setSkip(0);
        }}
        verified={verified}
        onVerifiedChange={(value) => {
          setVerified(value);
          setSkip(0);
        }}
        onReset={resetFilters}
        hasFilters={hasFilters}
      />

      <Card className="border-border/50 bg-card/60">
        <CardContent className="p-0">
          <UsersTable
            rows={data?.data ?? []}
            isLoading={isLoading && !data}
            currentUserId={currentUserId}
            onActivate={(u) => {
              setAction("activate", u);
            }}
            onDeactivate={(u) => {
              setAction("deactivate", u);
            }}
            onReset={(u) => {
              setAction("reset", u);
            }}
            onDelete={(u) => {
              setAction("delete", u);
            }}
          />
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

      <UserActionDialogs
        action={pending.kind}
        onOpenChange={(open) => {
          if (!open) clearAction();
        }}
        onConfirm={runAction}
        isLoading={isActionLoading}
      />
    </div>
  );
}
