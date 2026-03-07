import { Lock } from "lucide-react";
import { motion } from "motion/react";

interface LoginHeaderProps {
  t: (key: string) => string;
}

export function LoginHeader({ t }: LoginHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
      >
        <Lock className="h-6 w-6" />
      </motion.div>
      <h1 className="text-3xl font-bold tracking-tight">{t("login.title")}</h1>
      <p className="text-muted-foreground mt-2">{t("login.subtitle")}</p>
    </div>
  );
}
