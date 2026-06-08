"use client";

import { useState } from "react";

import Image from "next/image";

import { cn } from "@/lib/utils";

interface AttachmentThumbProps {
  url: string;
  filename: string | null;
}

// A single message-attachment preview. `next/image` renders nothing until the
// Cloudinary bytes arrive, so we hold a `loaded` flag and show a pulsing
// skeleton box meanwhile, then fade the image in. On error we still clear the
// skeleton so the browser's broken-image glyph isn't masked behind it.
export function AttachmentThumb({ url, filename }: AttachmentThumbProps) {
  const [loaded, setLoaded] = useState(false);

  const settle = () => {
    setLoaded(true);
  };

  return (
    // Plain <a>, not next/link: this points at an external Cloudinary file URL
    // opened in a new tab — Link is for internal client-side navigation.
    <a href={url} target="_blank" rel="noreferrer">
      <span
        className={cn(
          "block h-20 w-20 overflow-hidden rounded-lg",
          !loaded && "animate-pulse bg-muted",
        )}
      >
        <Image
          src={url}
          alt={filename ?? ""}
          width={80}
          height={80}
          className={cn(
            "h-20 w-20 rounded-lg object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={settle}
          onError={settle}
        />
      </span>
    </a>
  );
}
