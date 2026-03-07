import { type LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface AuthHeaderProps {
  t: (key: string) => string;
  titleKey: string;
  subtitleKey: string;
  icon: LucideIcon;
}

export function AuthHeader({ t, titleKey, subtitleKey, icon: Icon }: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
      >
        <Icon className="h-6 w-6" />
      </motion.div>
      <h1 className="text-3xl font-bold tracking-tight">{t(titleKey)}</h1>
      <p className="text-muted-foreground mt-2">{t(subtitleKey)}</p>
    </div>
  );
}
