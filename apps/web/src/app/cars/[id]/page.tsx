import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClosedListing } from "@/components/listing/ClosedListing";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { ListingSpecs } from "@/components/listing/ListingSpecs";
import { ListingSummary, listingTitle } from "@/components/listing/ListingSummary";
import { RecordView } from "@/components/listing/RecordView";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactActions } from "@/components/ui/ContactActions";
import { Gallery } from "@/components/ui/Gallery";
import { PriceHistory } from "@/components/ui/PriceHistory";
import { TrustPanel } from "@/components/ui/TrustPanel";
import { getListing, getNow, getSimilarListings, getUsdKgsRate } from "@/data/listings";
import { modelId, slugify } from "@/data/search";
import { listingCrumbs } from "@/lib/breadcrumbs";
import { listingMetaDescription, listingMetaTitle } from "@/lib/seo";
import { buildTrustItems } from "@/lib/trust";

interface Props {
  params: Promise<{ id: string }>;
}

const SIMILAR_COUNT = 4;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing((await params).id);
  if (!listing) return { title: "Объявление не найдено", robots: { index: false } };
  return {
    title: listingMetaTitle(listing),
    description: listingMetaDescription(listing),
    // Closed listings stay reachable by link but leave search results.
    robots: listing.status === "active" ? undefined : { index: false, follow: true },
    alternates: { canonical: `/cars/${listing.id}` },
  };
}

export default async function ListingPage({ params }: Props) {
  const listing = await getListing((await params).id);
  if (!listing) notFound();
  const [now, rate, similar] = await Promise.all([
    getNow(),
    getUsdKgsRate(),
    getSimilarListings(listing, SIMILAR_COUNT),
  ]);

  const crumbs = (
    <Breadcrumbs
      items={listingCrumbs({
        make: { id: slugify(listing.make), label: listing.make },
        model: { id: modelId(listing.make, listing.model), label: listing.model },
      })}
    />
  );

  const similarSection = similar.length > 0 && (
    <section aria-labelledby="similar-heading" className="flex flex-col gap-4">
      <h2 id="similar-heading" className="text-2xl font-semibold tracking-tight text-fg">
        Похожие объявления
      </h2>
      <ListingGrid listings={similar} usdKgsRate={rate} now={now} />
    </section>
  );

  if (listing.status !== "active") {
    return (
      <main className="mx-auto flex w-full max-w-content flex-col gap-10 px-4 py-6 lg:py-8">
        <div className="-mb-6">{crumbs}</div>
        <ClosedListing listing={listing} now={now} />
        {similarSection}
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-content flex-col gap-10 px-4 pt-4 pb-24 lg:py-8">
      {/* One DOM order for every width: mobile reads top to bottom, desktop pins the summary right. */}
      <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-x-8">
        <div className="-mb-4 lg:col-span-3 lg:-mb-2">{crumbs}</div>
        <Gallery photos={listing.photos} title={listingTitle(listing)} className="lg:col-span-2" />
        <ListingSummary
          listing={listing}
          usdKgsRate={rate}
          now={now}
          // Floating card on desktop (docs/design/direction.md: shadow only on floating elements).
          className="lg:sticky lg:top-6 lg:col-start-3 lg:row-span-5 lg:row-start-2 lg:self-start lg:rounded-xl lg:bg-surface lg:p-6 lg:shadow-raised"
        />
        <ListingSpecs listing={listing} className="lg:col-span-2" />
        <TrustPanel items={buildTrustItems(listing, now)} className="lg:col-span-2" />
        <section
          aria-labelledby="description-heading"
          className="flex flex-col gap-3 lg:col-span-2"
        >
          <h2 id="description-heading" className="text-xl font-semibold tracking-tight text-fg">
            Описание
          </h2>
          {listing.description ? (
            <p className="max-w-prose text-base whitespace-pre-line text-fg">
              {listing.description}
            </p>
          ) : (
            <p className="text-sm text-fg-muted">Продавец не добавил описание.</p>
          )}
        </section>
        <PriceHistory points={listing.priceHistory} now={now} className="lg:col-span-2" />
      </div>

      {similarSection}
      <RecordView id={listing.id} />

      <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-xl bg-surface p-3 shadow-raised lg:hidden">
        <ContactActions contacts={listing.contacts} layout="bar" />
      </div>
    </main>
  );
}
