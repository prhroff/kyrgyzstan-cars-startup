import { cookies } from "next/headers";
import { CollectionTiles } from "@/components/home/CollectionTiles";
import { PopularMakes } from "@/components/home/PopularMakes";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { Services } from "@/components/home/Services";
import { decodeCityCookie } from "@/components/layout/city-cookie";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { LinkButton } from "@/components/ui/LinkButton";
import { getCatalogStats, getNow, getUsdKgsRate, searchListings } from "@/data/listings";
import { CITY_COOKIE, resolveCity } from "@/lib/city";
import { EMPTY_FILTERS } from "@/lib/filters";
import { formatNumber } from "@/lib/format";
import { catalogQueryString, type RawSearchParams } from "@/lib/search-params";

const LATEST_COUNT = 8;

interface Props {
  searchParams: Promise<RawSearchParams>;
}

function firstParam(v: string | string[] | undefined): string | null {
  return (Array.isArray(v) ? v[0] : v) ?? null;
}

/**
 * Structure of the Avito Auto home (docs/design/direction.md): heading with a count, collections,
 * popular makes, services, fresh listings; "Вы смотрели" on the right from 1280px.
 * City: URL first, cookie as the default.
 */
export default async function HomePage({ searchParams }: Props) {
  const [params, jar] = await Promise.all([searchParams, cookies()]);
  const { city, heading } = resolveCity(
    firstParam(params.city),
    decodeCityCookie(jar.get(CITY_COOKIE)?.value),
  );
  const cityFilters = { ...EMPTY_FILTERS, city };
  const [stats, fresh, now, rate] = await Promise.all([
    getCatalogStats(city),
    searchListings(cityFilters, "fresh", 1),
    getNow(),
    getUsdKgsRate(),
  ]);
  // Only the chosen city: listings from elsewhere under "Авто в Оше" would mislead.
  const latest = fresh.items.slice(0, LATEST_COUNT);

  return (
    <main className="mx-auto flex w-full max-w-content gap-10 px-4 pt-6 pb-10 lg:pt-8">
      <div className="flex min-w-0 flex-1 flex-col gap-12 lg:gap-16">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold tracking-tight text-fg lg:text-5xl">
            {heading} <span className="text-fg-subtle">{formatNumber(stats.total)}</span>
          </h1>
          <CollectionTiles city={city} />
        </div>

        <PopularMakes makes={stats.makes} city={city} />

        <Services />

        <section aria-labelledby="latest-heading" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="latest-heading" className="text-2xl font-semibold tracking-tight text-fg">
              Свежие объявления
            </h2>
            <LinkButton
              href={`/cars${catalogQueryString({ filters: cityFilters })}`}
              variant="secondary"
            >
              Смотреть все
            </LinkButton>
          </div>
          <ListingGrid listings={latest} usdKgsRate={rate} now={now} priorityCount={2} />
        </section>

        <RecentlyViewed variant="strip" />
      </div>
      <RecentlyViewed variant="aside" />
    </main>
  );
}
