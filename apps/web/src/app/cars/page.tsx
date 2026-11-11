import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SearchX } from "lucide-react";
import { CatalogControls } from "@/components/catalog/CatalogControls";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { Pagination } from "@/components/ui/Pagination";
import { getCities, getMakeOptions, getNow, getUsdKgsRate, searchListings } from "@/data/listings";
import { catalogQueryString, parseCatalogQuery, type RawSearchParams } from "@/lib/search-params";
import { catalogCrumbs } from "@/lib/breadcrumbs";
import { CATALOG_VIEW_COOKIE, parseCatalogView } from "@/lib/catalog-view";
import { formatNumber } from "@/lib/format";
import { catalogMeta } from "@/lib/seo";

interface Props {
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = parseCatalogQuery(await searchParams);
  const [result, makes] = await Promise.all([
    searchListings(query.filters, query.sort, query.page),
    getMakeOptions(),
  ]);
  const meta = catalogMeta(query.filters, result.total, makes);
  return {
    title: meta.title,
    description: meta.description,
    robots: meta.indexable ? undefined : { index: false, follow: true },
    alternates: { canonical: `/cars${catalogQueryString({ filters: query.filters })}` },
  };
}

export default async function CatalogPage({ searchParams }: Props) {
  const raw = await searchParams;
  const query = parseCatalogQuery(raw);
  const [result, makes, cities, now, rate, jar] = await Promise.all([
    searchListings(query.filters, query.sort, query.page),
    getMakeOptions(),
    getCities(),
    getNow(),
    getUsdKgsRate(),
    cookies(),
  ]);
  const view = parseCatalogView(jar.get(CATALOG_VIEW_COOKIE)?.value);
  const meta = catalogMeta(query.filters, result.total, makes);
  // "Все марки" (home) links with ?pick=make: open the make picker. Not a filter, not kept in links.
  const pickMake = raw.pick === "make";
  const make = makes.find((m) => m.id === query.filters.make) ?? null;
  const model = make?.models.find((m) => m.id === query.filters.model) ?? null;
  const crumbs = catalogCrumbs({ make, model, city: query.filters.city });
  const baseHref = `/cars${catalogQueryString({ filters: query.filters, sort: query.sort })}`;

  return (
    <main className="mx-auto flex w-full max-w-content flex-col gap-6 px-4 pt-6 pb-10 lg:gap-8 lg:pt-8">
      <div className="flex flex-col gap-2">
        <Breadcrumbs items={crumbs} />
        <h1 className="text-3xl font-semibold tracking-tight text-fg lg:text-5xl">
          {meta.h1} <span className="text-fg-subtle">{formatNumber(result.total)}</span>
        </h1>
      </div>
      <CatalogControls
        query={query}
        total={result.total}
        makes={makes}
        cities={cities}
        autoOpenMake={pickMake}
        initialView={view}
      >
        {result.items.length > 0 ? (
          <>
            <CatalogResults listings={result.items} usdKgsRate={rate} now={now} priorityCount={2} />
            <Pagination page={result.page} pageCount={result.pageCount} baseHref={baseHref} />
          </>
        ) : (
          <EmptyState
            icon={SearchX}
            title="Ничего не нашли"
            description="Попробуйте убрать часть фильтров"
            actions={
              <LinkButton href="/cars" variant="secondary">
                Сбросить фильтры
              </LinkButton>
            }
          />
        )}
      </CatalogControls>
    </main>
  );
}
