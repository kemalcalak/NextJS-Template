"use client";

import { useEffect, useState } from "react";

import { Hash } from "lucide-react";
import { AnimatePresence, motion, type MotionValue } from "motion/react";
import { useTranslation } from "react-i18next";

import { SPRING_SOFT, fadeUp } from "@/lib/motion/variants";

interface MockAuthor {
  name: string;
  initial: string;
  msgKey: string;
}

// Decorative preview content; names are neutral placeholders, messages come
// from i18n. The feed cycles through this pool forever.
const FEED_POOL: MockAuthor[] = [
  { name: "Deniz", initial: "D", msgKey: "mock.msg1" },
  { name: "Mira", initial: "M", msgKey: "mock.msg2" },
  { name: "Alex", initial: "A", msgKey: "mock.msg3" },
  { name: "Sam", initial: "S", msgKey: "mock.msg4" },
  { name: "Lena", initial: "L", msgKey: "mock.msg5" },
];

interface FeedEntry {
  id: number;
  poolIndex: number;
}

const VISIBLE_MESSAGES = 3;
const IDLE_MS = 2600;
const TYPING_MS = 1400;

// Pure state updater: drop the oldest entry, append the next author in the
// pool. Module-level so the timer chain in the effect stays shallow.
const advanceFeed = (prev: FeedEntry[]): FeedEntry[] => {
  const last = prev[prev.length - 1];
  return [
    ...prev.slice(-(VISIBLE_MESSAGES - 1)),
    { id: last.id + 1, poolIndex: (last.poolIndex + 1) % FEED_POOL.length },
  ];
};

interface HeroFeedMockProps {
  rotateX: MotionValue<number>;
  y: MotionValue<number>;
}

// Glassy community-feed preview window that keeps living: idle → typing
// indicator → a new message lands, the oldest one scrolls away. Scroll
// transforms (straightening 3D tilt + drift) are driven by the hero.
export function HeroFeedMock({ rotateX, y }: HeroFeedMockProps) {
  const { t } = useTranslation("home");

  const [feed, setFeed] = useState<FeedEntry[]>([
    { id: 0, poolIndex: 0 },
    { id: 1, poolIndex: 1 },
    { id: 2, poolIndex: 2 },
  ]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const cycle = () => {
      timeout = setTimeout(() => {
        setTyping(true);
        timeout = setTimeout(() => {
          setTyping(false);
          setFeed(advanceFeed);
          cycle();
        }, TYPING_MS);
      }, IDLE_MS);
    };
    cycle();
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const nextAuthor = FEED_POOL[(feed[feed.length - 1].poolIndex + 1) % FEED_POOL.length];

  return (
    <motion.div
      variants={fadeUp}
      style={{ rotateX, y, transformPerspective: 1200 }}
      className="mx-auto mt-12 w-full max-w-2xl text-left"
    >
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-2xl shadow-primary/10 backdrop-blur-md">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
          <span aria-hidden className="h-3 w-3 rounded-full bg-destructive/70" />
          <span aria-hidden className="h-3 w-3 rounded-full bg-primary/40" />
          <span aria-hidden className="h-3 w-3 rounded-full bg-primary/70" />
          <span className="ml-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Hash className="h-3.5 w-3.5" />
            {t("mock.channel")}
          </span>
        </div>

        {/* Feed */}
        <div className="space-y-4 px-5 py-5">
          <div className="min-h-[10.5rem] space-y-4">
            <AnimatePresence initial={false} mode="popLayout">
              {feed.map(({ id, poolIndex }) => {
                const { name, initial, msgKey } = FEED_POOL[poolIndex];
                return (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -14, scale: 0.98 }}
                    transition={SPRING_SOFT}
                    className="flex items-start gap-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">{name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{t(msgKey)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Typing indicator */}
          <motion.div
            animate={{ opacity: typing ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 pt-1 text-xs text-muted-foreground"
          >
            <span className="flex gap-1">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.2 }}
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                />
              ))}
            </span>
            {t("mock.typing", { name: nextAuthor.name })}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
