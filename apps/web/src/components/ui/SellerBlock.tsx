import type { SellerType } from "@repo/core";
import { Ship, Store, User, type LucideIcon } from "lucide-react";
import type { SellerProfile } from "@/data/types";
import { cx } from "@/lib/cx";
import { formatMemberSince, formatNumber, pluralRu } from "@/lib/format";
import { SELLER_TYPE_LABELS } from "@/lib/labels";

const ICON: Record<SellerType, LucideIcon> = { private: User, dealer: Store, importer: Ship };

export interface SellerBlockProps {
  seller: SellerProfile;
  className?: string;
}

/** Who sells: type, name, since when on the site, how many listings. Facts only, no "надёжный". */
export function SellerBlock({ seller, className }: SellerBlockProps) {
  const Icon = ICON[seller.type];
  const name = seller.name?.trim();
  const n = seller.activeListings;
  return (
    <section aria-label="Продавец" className={cx("flex gap-3", className)}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
        <Icon aria-hidden className="size-5 text-fg-muted" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-base font-medium break-words text-fg">
          {name ?? SELLER_TYPE_LABELS[seller.type]}
        </p>
        {name && <p className="text-sm text-fg-muted">{SELLER_TYPE_LABELS[seller.type]}</p>}
        <p className="text-sm text-fg-muted">{formatMemberSince(seller.memberSince)}</p>
        <p className="text-sm text-fg-muted">
          {`${formatNumber(n)} ${pluralRu(n, ["объявление", "объявления", "объявлений"])} на сайте`}
        </p>
      </div>
    </section>
  );
}
