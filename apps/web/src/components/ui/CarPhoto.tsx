import { ImageOff } from "lucide-react";
import Image from "next/image";
import { cx } from "@/lib/cx";
import type { CarPhoto as CarPhotoData } from "@/lib/listing-card";

export interface CarPhotoProps {
  photo: CarPhotoData | null | undefined;
  alt: string;
  /** next/image `sizes` — how wide the photo is rendered at each breakpoint. */
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** 4:3 photo frame. Missing photo → neutral placeholder with an icon (never a stock image). */
export function CarPhoto({ photo, alt, sizes, priority = false, className }: CarPhotoProps) {
  return (
    <div className={cx("relative aspect-4/3 w-full overflow-hidden bg-surface-muted", className)}>
      {photo ? (
        <Image
          src={photo.url}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-fg-subtle">
          <ImageOff aria-hidden className="size-8" />
          <span className="text-sm">Нет фото</span>
        </div>
      )}
    </div>
  );
}
