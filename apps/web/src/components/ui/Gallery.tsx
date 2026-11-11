"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/lib/cx";
import type { CarPhoto as CarPhotoData } from "@/lib/listing-card";
import { Button } from "./Button";
import { CarPhoto } from "./CarPhoto";
import { focusRing } from "./styles";

export interface GalleryProps {
  photos: readonly CarPhotoData[];
  /** Used for alt text: "Toyota Camry 2021, фото 2 из 8". */
  title: string;
  className?: string;
}

/** Index after moving by `delta`, wrapping around. Exported for tests. */
export function wrapIndex(index: number, delta: number, length: number): number {
  if (length <= 0) return 0;
  return (((index + delta) % length) + length) % length;
}

export function Gallery({ photos, title, className }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const current = photos[Math.min(index, Math.max(count - 1, 0))];
  const go = (delta: number) => {
    setIndex((i) => wrapIndex(i, delta, count));
  };

  if (count === 0) {
    return (
      <div className={cx("overflow-hidden rounded-lg border border-line", className)}>
        <CarPhoto photo={null} alt={title} sizes="(min-width: 1024px) 640px, 100vw" />
      </div>
    );
  }

  return (
    <section
      aria-roledescription="галерея"
      aria-label={`Фото: ${title}`}
      className={cx("flex min-w-0 flex-col gap-2", className)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      <div className="relative overflow-hidden rounded-lg border border-line">
        <CarPhoto
          photo={current}
          alt={`${title}, фото ${index + 1} из ${count}`}
          sizes="(min-width: 1024px) 640px, 100vw"
          priority
        />
        {count > 1 && (
          <>
            <div className="absolute inset-y-0 left-2 flex items-center">
              <Button
                variant="secondary"
                size="md"
                iconOnly
                iconLeading={ChevronLeft}
                aria-label="Предыдущее фото"
                onPress={() => {
                  go(-1);
                }}
              />
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center">
              <Button
                variant="secondary"
                size="md"
                iconOnly
                iconLeading={ChevronRight}
                aria-label="Следующее фото"
                onPress={() => {
                  go(1);
                }}
              />
            </div>
            <span
              aria-live="polite"
              className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-overlay px-2 py-0.5 text-xs font-medium text-fg-on-accent tabular-nums"
            >
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <ul aria-label="Миниатюры" className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <li key={photo.id} className="shrink-0">
              <AriaButton
                aria-label={`Фото ${i + 1} из ${count}`}
                {...(i === index ? { "aria-current": "true" as const } : {})}
                onPress={() => {
                  setIndex(i);
                }}
                className={cx(
                  "relative block aspect-4/3 w-20 cursor-pointer overflow-hidden rounded-md border-2 bg-surface-muted",
                  i === index ? "border-accent" : "border-transparent ui-hover:border-line-strong",
                  focusRing,
                )}
              >
                <Image src={photo.url} alt="" fill sizes="80px" className="object-cover" />
              </AriaButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
