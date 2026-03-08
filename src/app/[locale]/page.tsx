"use client";

import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { getLocaleFromPath } from "@/lib/config/routes";
import { useAuthStore } from "@/stores/auth.store";

const Home = () => {
  // Specify the 'home' namespace instead of relying on default
  const { t } = useTranslation("home");
  const { user } = useAuthStore();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-6"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            {t("title", "Welcome")}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle", "Your daily management app")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {user ? (
              <Button
                size="lg"
                onClick={() => {
                  router.push(`/${currentLocale}/dashboard`);
                }}
                className="w-full sm:w-auto"
              >
                {t("cta.dashboard", "Go to Dashboard")}
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => {
                    router.push(`/${currentLocale}/login`);
                  }}
                  className="w-full sm:w-auto"
                >
                  {t("cta.login", "Login")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    router.push(`/${currentLocale}/register`);
                  }}
                  className="w-full sm:w-auto"
                >
                  {t("cta.register", "Register")}
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features Section Container */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("features.title", "Features")}
          </h2>

          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card p-6 rounded-xl shadow-sm border border-border"
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                🚀
              </div>
              <h3 className="font-semibold">{t("features.item1", "Fast")}</h3>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card p-6 rounded-xl shadow-sm border border-border"
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                🔄
              </div>
              <h3 className="font-semibold">{t("features.item2", "Sync")}</h3>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card p-6 rounded-xl shadow-sm border border-border"
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                ✨
              </div>
              <h3 className="font-semibold">{t("features.item3", "Design")}</h3>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
