"use client";

import { useState } from "react";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { ActivityTable } from "@/components/admin/ActivityTable";
import { StatusBadge, UserStatusBadge } from "@/components/admin/StatusBadge";
import { UserActionDialogs, type UserActionKind } from "@/components/admin/UserActionDialogs";
import { UserDangerZone } from "@/components/admin/UserDangerZone";
import { UserEditForm } from "@/components/admin/UserEditForm";
import { UserOverviewCard } from "@/components/admin/UserOverviewCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useActivateAdminUser,
  useAdminUser,
  useAdminUserActivities,
  useDeactivateAdminUser,
  useDeleteAdminUser,
  useResetAdminUserPassword,
  useUpdateAdminUser,
} from "@/hooks/api/use-admin";
import { ROUTES, getLocaleFromPath, getLocalizedPath } from "@/lib/config/routes";
import type { AdminUserUpdatePayload } from "@/lib/types/admin";
import { useAuthStore } from "@/stores/auth.store";

export function UserDetailContent({ userId }: { userId: string }) {
  const { t, i18n } = useTranslation("admin");
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const { user: currentUser } = useAuthStore();

  const { data: user, isLoading } = useAdminUser(userId);
  const { data: activities, isLoading: activitiesLoading } = useAdminUserActivities(userId, {
    limit: 20,
  });
  const update = useUpdateAdminUser();
  const activate = useActivateAdminUser();
  const deactivate = useDeactivateAdminUser();
  const remove = useDeleteAdminUser();
  const resetPassword = useResetAdminUserPassword();

  const [action, setAction] = useState<UserActionKind>(null);

  if (isLoading || !user) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t("users.loading")}
      </div>
    );
  }

  const isSelf = currentUser?.id === user.id;

  const handleSave = (payload: AdminUserUpdatePayload) => {
    update.mutate({ id: user.id, payload });
  };

  const runAction = () => {
    if (!action) return;
    const onSettled = () => {
      setAction(null);
    };
    if (action === "activate") activate.mutate(user.id, { onSettled });
    else if (action === "deactivate") deactivate.mutate(user.id, { onSettled });
    else if (action === "reset")
      resetPassword.mutate({ id: user.id, lang: i18n.language }, { onSettled });
    else
      remove.mutate(user.id, {
        onSuccess: () => {
          router.push(getLocalizedPath(ROUTES.adminUsers, currentLocale));
        },
        onSettled,
      });
  };

  const actionLoading =
    activate.isPending || deactivate.isPending || remove.isPending || resetPassword.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href={getLocalizedPath(ROUTES.adminUsers, currentLocale)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("userDetail.backToUsers")}
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            {user.first_name || user.last_name
              ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
              : user.email}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={user.role === "admin" ? "primary" : "muted"}>
            {t(`users.role.${user.role}` as const)}
          </StatusBadge>
          <UserStatusBadge user={user} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UserEditForm
            user={user}
            isSelf={isSelf}
            isSaving={update.isPending}
            onSubmit={handleSave}
          />
        </div>
        <UserOverviewCard user={user} />
      </div>

      <UserDangerZone
        user={user}
        isSelf={isSelf}
        disabled={actionLoading}
        onReset={() => {
          setAction("reset");
        }}
        onActivate={() => {
          setAction("activate");
        }}
        onDeactivate={() => {
          setAction("deactivate");
        }}
        onDelete={() => {
          setAction("delete");
        }}
      />

      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">{t("userDetail.activityTitle")}</CardTitle>
          <CardDescription>{t("userDetail.activityDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityTable
            rows={activities?.data ?? []}
            isLoading={activitiesLoading}
            showUser={false}
            emptyLabel={t("userDetail.activityEmpty")}
          />
        </CardContent>
      </Card>

      <UserActionDialogs
        action={action}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        onConfirm={runAction}
        isLoading={actionLoading}
      />
    </div>
  );
}
