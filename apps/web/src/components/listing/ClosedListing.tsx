import { Archive, CircleCheck } from "lucide-react";
import { CarPhoto } from "@/components/ui/CarPhoto";
import { LinkButton } from "@/components/ui/LinkButton";
import type { ListingDetail } from "@/data/types";
import { formatDate, formatPrice } from "@/lib/format";
import { listingTitle } from "./ListingSummary";

/** Status line for a listing that is no longer active. Says only what we know and when. */
export function closedText(
  l: Pick<ListingDetail, "status" | "closedAt">,
  now: Date,
): {
  title: string;
  detail: string | null;
} {
  const when = l.closedAt ? formatDate(l.closedAt, now) : null;
  if (l.status === "sold") {
    return {
      title: "Машина продана",
      detail: when
        ? `Продавец отметил машину проданной ${when}`
        : "Продавец отметил машину проданной",
    };
  }
  return {
    title: "Объявление снято с публикации",
    detail: when ? `Снято ${when}` : null,
  };
}

/** Sold / removed listing: what it was, that it's closed, and a way forward (similar listings). */
export function ClosedListing({ listing, now }: { listing: ListingDetail; now: Date }) {
  const { title, detail } = closedText(listing, now);
  const Icon = listing.status === "sold" ? CircleCheck : Archive;
  return (
    <section className="flex flex-col gap-5 rounded-xl bg-surface-muted p-4 sm:flex-row sm:p-6">
      <CarPhoto
        photo={listing.photos[0]}
        alt={listingTitle(listing)}
        sizes="(min-width: 640px) 288px, 100vw"
        className="rounded-lg sm:w-72 sm:shrink-0"
      />
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center gap-2 text-fg-muted">
          <Icon aria-hidden className="size-5 shrink-0" />
          <p className="text-base font-medium text-fg">{title}</p>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-fg">{listingTitle(listing)}</h1>
        <p className="text-sm text-fg-muted">
          Последняя цена: {formatPrice(listing.priceAmount, listing.currency)}
        </p>
        {detail && <p className="text-sm text-fg-subtle">{detail}</p>}
        <div>
          <LinkButton href="/cars" variant="secondary">
            Смотреть другие объявления
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
