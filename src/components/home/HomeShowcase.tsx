"use client";

import { useEffect, useRef, useState } from "react";

import {
  BookOpen,
  Camera,
  Code2,
  Gamepad2,
  MessagesSquare,
  Music4,
  Plane,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useTranslation } from "react-i18next";

import { SectionHeader } from "@/components/common/SectionHeader";

interface ShowcaseCardDef {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  replies: number;
  avatars: string[];
}

// Placeholder topic previews — replace with live community content later.
const CARDS: ShowcaseCardDef[] = [
  {
    icon: MessagesSquare,
    titleKey: "showcase.card1Title",
    descKey: "showcase.card1Desc",
    replies: 128,
    avatars: ["D", "M", "A"],
  },
  {
    icon: Code2,
    titleKey: "showcase.card2Title",
    descKey: "showcase.card2Desc",
    replies: 86,
    avatars: ["S", "E", "K"],
  },
  {
    icon: Gamepad2,
    titleKey: "showcase.card3Title",
    descKey: "showcase.card3Desc",
    replies: 214,
    avatars: ["L", "B", "T"],
  },
  {
    icon: BookOpen,
    titleKey: "showcase.card4Title",
    descKey: "showcase.card4Desc",
    replies: 59,
    avatars: ["N", "C", "Z"],
  },
  {
    icon: Music4,
    titleKey: "showcase.card5Title",
    descKey: "showcase.card5Desc",
    replies: 173,
    avatars: ["R", "J", "P"],
  },
  {
    icon: Plane,
    titleKey: "showcase.card6Title",
    descKey: "showcase.card6Desc",
    replies: 95,
    avatars: ["G", "F", "Y"],
  },
  {
    icon: UtensilsCrossed,
    titleKey: "showcase.card7Title",
    descKey: "showcase.card7Desc",
    replies: 142,
    avatars: ["H", "O", "V"],
  },
  {
    icon: Camera,
    titleKey: "showcase.card8Title",
    descKey: "showcase.card8Desc",
    replies: 67,
    avatars: ["W", "U", "I"],
  },
];

// The section pins while vertical scroll drives the card track horizontally.
// The shift is measured in pixels (track width minus viewport width), so the
// ride always ends with the last card flush to the right edge — no dead space
// on wide screens, and the section simply doesn't slide when everything fits.
export function HomeShowcase() {
  const { t } = useTranslation("home");
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxShift, setMaxShift] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;
      setMaxShift(Math.max(0, track.scrollWidth - viewport.clientWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef });
  const x = useTransform(scrollYProgress, [0.08, 0.92], [0, -maxShift]);
  const trackProgress = useTransform(scrollYProgress, [0.08, 0.92], [0, 1]);

  return (
    <section ref={sectionRef} className="relative h-[240vh] border-t border-border/60">
      <div className="mesh-glow sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <SectionHeader
          eyebrow={t("showcase.eyebrow")}
          title={t("showcase.title")}
          subtitle={t("showcase.subtitle")}
          className="mb-10 px-4"
        />

        <div ref={viewportRef} className="relative">
          {/* Edge fades so cards dissolve instead of clipping hard */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent"
          />

          <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-6 px-8 py-2">
            {CARDS.map(({ icon: Icon, titleKey, descKey, replies, avatars }) => (
              <div
                key={titleKey}
                className="flex w-[20rem] shrink-0 flex-col rounded-2xl border border-border bg-card/80 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:w-[24rem]"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{t(titleKey)}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t(descKey)}
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <div aria-hidden className="flex -space-x-2">
                    {avatars.map((initial) => (
                      <span
                        key={initial}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary/15 text-[10px] font-semibold text-primary"
                      >
                        {initial}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">
                    {t("showcase.replies", { count: replies })}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Ride progress */}
        <div className="mx-auto mt-10 h-1 w-44 overflow-hidden rounded-full bg-border">
          <motion.div
            style={{ scaleX: trackProgress }}
            className="h-full origin-left rounded-full bg-primary"
          />
        </div>
      </div>
    </section>
  );
}
