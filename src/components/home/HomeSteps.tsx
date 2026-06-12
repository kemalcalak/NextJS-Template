"use client";

import { useRef } from "react";

import { motion, useScroll, useTransform } from "motion/react";
import { useTranslation } from "react-i18next";

import { SectionHeader } from "@/components/common/SectionHeader";
import { EASE_OUT, slideInLeft, slideInRight } from "@/lib/motion/variants";

import type { Variants } from "motion/react";

interface StepDef {
  titleKey: string;
  descKey: string;
}

// Inherits hidden/visible from the step row's whileInView, so the badge pops
// exactly when its row reveals — no separate viewport observer (a threshold
// of 1 can silently never fire on subpixel layouts).
const badgePop: Variants = {
  hidden: { scale: 0.4, opacity: 0 },
  visible: {
    scale: [0.4, 1.18, 1],
    opacity: 1,
    transition: { duration: 0.55, ease: EASE_OUT, delay: 0.15 },
  },
};

const STEPS: StepDef[] = [
  { titleKey: "steps.step1Title", descKey: "steps.step1Desc" },
  { titleKey: "steps.step2Title", descKey: "steps.step2Desc" },
  { titleKey: "steps.step3Title", descKey: "steps.step3Desc" },
];

// Steps alternate sliding in from the left and right along a center spine
// that fills with the accent color as you scroll past; each number badge
// pops when its step arrives.
export function HomeSteps() {
  const { t } = useTranslation("home");

  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.8", "end 0.55"],
  });
  const spineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="border-t border-border/60 bg-muted/40 py-24">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <SectionHeader eyebrow={t("steps.eyebrow")} title={t("steps.title")} className="mb-16" />

        <div ref={listRef} className="relative space-y-12">
          {/* Center spine: muted base + scroll-filled accent overlay */}
          <div aria-hidden className="absolute inset-y-0 left-6 w-px bg-border/70 sm:left-1/2" />
          <motion.div
            aria-hidden
            style={{ scaleY: spineScale }}
            className="absolute inset-y-0 left-6 w-px origin-top bg-gradient-to-b from-primary via-primary/70 to-primary/30 sm:left-1/2"
          />

          {STEPS.map(({ titleKey, descKey }, index) => {
            const fromLeft = index % 2 === 0;
            return (
              <motion.div
                key={titleKey}
                variants={fromLeft ? slideInLeft : slideInRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                className={`relative flex items-start gap-5 pl-14 sm:w-1/2 sm:pl-0 ${
                  fromLeft
                    ? "sm:mr-auto sm:flex-row-reverse sm:pr-10 sm:text-right"
                    : "sm:ml-auto sm:pl-10"
                }`}
              >
                <motion.span
                  variants={badgePop}
                  className="absolute left-2.5 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 sm:static sm:shrink-0"
                >
                  {index + 1}
                </motion.span>
                <div>
                  <h3 className="text-xl font-semibold">{t(titleKey)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
