import { MapPin } from "lucide-react";
import { ContactActions } from "@/components/ui/ContactActions";
import { MarketRange } from "@/components/ui/MarketRange";
import { PriceTag } from "@/components/ui/PriceTag";
import { SellerBlock } from "@/components/ui/SellerBlock";
import type { ListingDetail } from "@/data/types";
import { cx } from "@/lib/cx";
import { formatDaysOnSite } from "@/lib/format";

export function listingTitle(l: Pick<ListingDetail, "make" | "model" | "year">): string {
  return `${l.make} ${l.model}, ${l.year}`;
}

export interface ListingSummaryProps {
  listing: ListingDetail;
  usdKgsRate: number;
  now: Date;
  className?: string;
}

/**
 * Title, price, market scale, contacts and seller. Sidebar on desktop; right under the gallery on
 * mobile, where contacts move to the sticky bottom bar instead.
 */
export function ListingSummary({ listing, usdKgsRate, now, className }: ListingSummaryProps) {
  const days = formatDaysOnSite(listing.publishedAt, now);
  return (
    <div className={cx("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-fg lg:text-3xl">
          {listingTitle(listing)}
        </h1>
        {listing.trim && <p className="text-base text-fg-muted">{listing.trim}</p>}
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-subtle">
          {listing.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden className="size-4" />
              {listing.city}
            </span>
          )}
          {days && <span>{days}</span>}
        </p>
      </div>

      <PriceTag
        size="lg"
        amount={listing.priceAmount}
        currency={listing.currency}
        priceUsd={listing.priceUsd}
        usdKgsRate={usdKgsRate}
      />
      <MarketRange
        position={listing.marketEstimate?.position ?? null}
        diffPercent={listing.marketEstimate?.diffPercent ?? null}
      />

      <div className="hidden flex-col gap-3 lg:flex">
        <ContactActions contacts={listing.contacts} />
        <p className="text-sm text-fg-muted">Не переводите предоплату до осмотра машины.</p>
      </div>

      <SellerBlock seller={listing.seller} className="border-t border-line pt-5" />
    </div>
  );
}
