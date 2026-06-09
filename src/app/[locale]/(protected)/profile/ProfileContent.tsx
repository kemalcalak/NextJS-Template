"use client";

import { useState } from "react";

import { Tabs } from "antd";
import { User, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileInfoTab } from "@/components/profile/ProfileInfoTab";
import { SecurityTab } from "@/components/profile/SecurityTab";

interface ProfileContentProps {
  // Hidden on the admin-panel profile so admins can't self-deactivate.
  showDangerZone?: boolean;
}

export function ProfileContent({ showDangerZone = true }: ProfileContentProps) {
  const { t } = useTranslation("profile");
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");

  const tabItems = [
    {
      key: "info",
      label: (
        <span className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">{t("tabs.info")}</span>
        </span>
      ),
    },
    {
      key: "security",
      label: (
        <span className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">{t("tabs.security")}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
      <div className="mx-auto w-full max-w-480 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </motion.div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key as "info" | "security");
          }}
          items={tabItems}
        />

        <AnimatePresence mode="wait">
          {activeTab === "info" && (
            <motion.div
              key="info-motion"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-6">
                <ProfileAvatar />
                <ProfileInfoTab />
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security-motion"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SecurityTab showDangerZone={showDangerZone} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
