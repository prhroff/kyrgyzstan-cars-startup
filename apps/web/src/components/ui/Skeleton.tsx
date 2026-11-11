import { cx } from "@/lib/cx";

/** A grey placeholder block. Size it with token classes: `<Skeleton className="h-4 w-24" />`. */
export function Skeleton({ className, square = false }: { className?: string; square?: boolean }) {
  return (
    <div
      aria-hidden
      className={cx("animate-pulse bg-surface-muted", !square && "rounded-sm", className)}
    />
  );
}

/** Announces loading to screen readers once; visual skeletons inside stay hidden from them. */
export function LoadingRegion({
  label = "Загрузка",
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function CarCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      <Skeleton square className="aspect-4/3 w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  );
}
