"use client";

import { Badge } from "antd";
import { Bell, LayoutDashboard, LifeBuoy, ShieldCheck, User as UserIcon, X } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { drawerItem } from "@/components/common/app-drawer-motion";
import { BrandLogo } from "@/components/common/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUnreadCount } from "@/hooks/api/use-notifications";
import { useBranding } from "@/hooks/use-branding";
import { ROUTES } from "@/lib/config/routes";
import { SystemRole } from "@/lib/types/user";
import { cn } from "@/lib/utils";
import type { User } from "@/stores/auth.store";

interface DrawerTitleProps {
  onClose: () => void;
}

export const DrawerTitle = ({ onClose }: DrawerTitleProps) => {
  const { t } = useTranslation();
  const { siteName } = useBranding();
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2.5">
        <BrandLogo className="h-8 w-8 rounded-xl text-sm" />
        <span className="text-xl font-semibold tracking-tight">
          {siteName}
          <span className="text-primary">.</span>
        </span>
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("common:ui.close", "Close")}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface UserProfileProps {
  user: NonNullable<User>;
}

export const UserProfile = ({ user }: UserProfileProps) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border">
    <span className="rounded-full bg-gradient-to-br from-primary to-primary/40 p-0.5">
      <Avatar className="h-11 w-11 border-2 border-background">
        {user.avatar_file?.url && <AvatarImage src={user.avatar_file.url} alt={user.email} />}
        <AvatarFallback className="bg-primary/10 text-primary">
          {user.first_name?.charAt(0).toUpperCase() || <UserIcon className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>
    </span>
    <div className="flex min-w-0 flex-col">
      <p className="truncate text-base font-bold">
        {user.first_name} {user.last_name}
      </p>
      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
    </div>
  </div>
);

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: (href: string) => void;
  badge?: number;
}

export const NavLink = ({ href, icon: Icon, label, active, onClick, badge = 0 }: NavLinkProps) => (
  <motion.div variants={drawerItem}>
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "relative w-full justify-start h-11 rounded-xl font-medium transition-all px-4",
        active && "bg-primary/10! text-primary! hover:bg-primary/15!",
      )}
      onClick={() => {
        onClick(href);
      }}
    >
      {/* Accent bar marks the active entry */}
      {active && (
        <span className="absolute left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary" />
      )}
      <span className="flex w-full items-center">
        <Icon className={cn("mr-3 h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
        {label}
        {badge > 0 && <Badge count={badge} size="small" className="ml-auto" />}
      </span>
    </Button>
  </motion.div>
);

// Nav links shown only to authenticated users. Extracted so the AppDrawer
// component itself stays under the max-lines-per-function budget.
interface AuthedNavLinksProps {
  user: NonNullable<User>;
  isActive: (path: string) => boolean;
  navigate: (href: string) => void;
}

export const AuthedNavLinks = ({ user, isActive, navigate }: AuthedNavLinksProps) => {
  const { t } = useTranslation();
  const { data: unread } = useUnreadCount();
  return (
    <>
      {user.role === SystemRole.ADMIN && (
        <NavLink
          href={ROUTES.adminDashboard}
          icon={ShieldCheck}
          label={t("admin:shell.title", "Administration")}
          active={isActive(ROUTES.adminDashboard)}
          onClick={navigate}
        />
      )}
      <NavLink
        href={ROUTES.dashboard}
        icon={LayoutDashboard}
        label={t("common:nav.dashboard")}
        active={isActive(ROUTES.dashboard)}
        onClick={navigate}
      />
      <NavLink
        href={ROUTES.notifications}
        icon={Bell}
        label={t("common:nav.notifications")}
        active={isActive(ROUTES.notifications)}
        onClick={navigate}
        badge={unread?.unread_count ?? 0}
      />
      <NavLink
        href={ROUTES.profile}
        icon={UserIcon}
        label={t("common:nav.profile")}
        active={isActive(ROUTES.profile)}
        onClick={navigate}
      />
      <NavLink
        href={ROUTES.support}
        icon={LifeBuoy}
        label={t("common:nav.support")}
        active={isActive(ROUTES.support)}
        onClick={navigate}
      />
    </>
  );
};
