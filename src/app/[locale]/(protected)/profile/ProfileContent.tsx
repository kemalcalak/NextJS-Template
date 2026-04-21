"use client";

import { useState } from "react";

import { User, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

import { ProfileInfoTab } from "@/components/profile/ProfileInfoTab";
import { SecurityTab } from "@/components/profile/SecurityTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfileContent() {
  const { t } = useTranslation("profile");
  const [activeTab, setActiveTab] = useState("info");

  const tabs = [
    { id: "info" as const, label: t("tabs.info"), icon: User },
    { id: "security" as const, label: t("tabs.security"), icon: Shield },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
      <div className="mx-auto w-full max-w-[1920px] space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </motion.div>

        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-lg w-fit mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-2 relative"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <TabsContent value="info" key="info-content" forceMount>
                <motion.div
                  key="info-motion"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileInfoTab />
                </motion.div>
              </TabsContent>
            )}

            {activeTab === "security" && (
              <TabsContent value="security" key="security-content" forceMount>
                <motion.div
                  key="security-motion"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SecurityTab />
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
