"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CarCard } from "@/components/ui/CarCard";
import { ContactActions } from "@/components/ui/ContactActions";
import { Footer } from "@/components/ui/Footer";
import { Header } from "@/components/ui/Header";
import { MarketRange } from "@/components/ui/MarketRange";
import { Pagination } from "@/components/ui/Pagination";
import { PriceHistory } from "@/components/ui/PriceHistory";
import { SellerBlock } from "@/components/ui/SellerBlock";
import { SortSelect } from "@/components/ui/SortSelect";
import { TrustPanel } from "@/components/ui/TrustPanel";
import { FIXTURE_LISTINGS, FIXTURE_NOW, FIXTURE_USD_KGS_RATE } from "@/data/fixtures";
import type { ListingDetail, Sort } from "@/data/types";
import { buildTrustItems } from "@/lib/trust";
import { Section, State } from "./showcase-parts";

function fixture(id: string): ListingDetail {
  const l = FIXTURE_LISTINGS.find((x) => x.id === id);
  if (!l) throw new Error(`showcase fixture ${id} missing`);
  return l;
}

const OK = fixture("demo-ok");
const WARN = fixture("demo-warn");
const NO_DATA = fixture("demo-nodata");
const NO_VIN = fixture("demo-novin");

const trust = (l: ListingDetail) => buildTrustItems(l, FIXTURE_NOW);

/** Showcase sections for the listing page components. */
export function ListingSections() {
  const [sort, setSort] = useState<Sort>("fresh");

  return (
    <>
      <Section id="trust" title="TrustPanel">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <State label="всё в порядке">
            <TrustPanel items={trust(OK)} headingLevel={3} />
          </State>
          <State label="есть предупреждения (сильно ниже рынка, VIN с ошибкой)">
            <TrustPanel items={trust(WARN)} headingLevel={3} />
          </State>
          <State label="почти нет данных">
            <TrustPanel items={trust(NO_DATA)} headingLevel={3} />
          </State>
          <State label="без VIN">
            <TrustPanel items={trust(NO_VIN)} headingLevel={3} />
          </State>
        </div>
      </Section>

      <Section id="market" title="MarketRange">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <State label="ниже рынка">
            <MarketRange position="below" diffPercent={-12} />
          </State>
          <State label="в рынке">
            <MarketRange position="fair" diffPercent={-3} />
          </State>
          <State label="выше рынка">
            <MarketRange position="above" diffPercent={14} />
          </State>
          <State label="нет оценки">
            <MarketRange position={null} />
          </State>
        </div>
      </Section>

      <Section id="history" title="PriceHistory">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <State label="2 снижения">
            <PriceHistory points={OK.priceHistory} now={FIXTURE_NOW} />
          </State>
          <State label="одна цена (не менялась)">
            <PriceHistory points={NO_VIN.priceHistory} now={FIXTURE_NOW} />
          </State>
          <State label="нет данных об истории">
            <PriceHistory points={[]} now={FIXTURE_NOW} />
          </State>
        </div>
      </Section>

      <Section id="seller" title="SellerBlock">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <State label="дилер">
            <SellerBlock seller={OK.seller} />
          </State>
          <State label="импортёр">
            <SellerBlock seller={WARN.seller} />
          </State>
          <State label="частное лицо с именем">
            <SellerBlock seller={NO_VIN.seller} />
          </State>
          <State label="частное лицо без имени">
            <SellerBlock seller={NO_DATA.seller} />
          </State>
        </div>
      </Section>

      <Section id="contacts" title="ContactActions">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <State label="телефон скрыт">
            <ContactActions contacts={OK.contacts} />
          </State>
          <State label="телефон показан">
            <ContactActions contacts={OK.contacts} defaultRevealed />
          </State>
          <State label="наведение / фокус" demo="hover focus">
            <ContactActions contacts={WARN.contacts} />
          </State>
          <State label="только телефон">
            <ContactActions contacts={NO_DATA.contacts} />
          </State>
        </div>
        <State label="мобильная панель внизу экрана">
          <div className="max-w-sm border-t border-line bg-surface p-3">
            <ContactActions contacts={OK.contacts} layout="bar" />
          </div>
        </State>
      </Section>

      <Section id="layout" title="Header, Footer">
        <State label="шапка">
          <Header />
        </State>
        <State label="подвал">
          <Footer />
        </State>
      </Section>

      <Section id="sort" title="SortSelect, Pagination">
        <div className="flex flex-col gap-6">
          <State label="сортировка" className="flex max-w-xs flex-col gap-2">
            <SortSelect value={sort} onChange={setSort} />
          </State>
          <State label="страница 1 из 3">
            <Pagination page={1} pageCount={3} baseHref="/cars" />
          </State>
          <State label="страница 5 из 12">
            <Pagination page={5} pageCount={12} baseHref="/cars?make=toyota" />
          </State>
          <State label="последняя страница, наведение" demo="hover">
            <Pagination page={12} pageCount={12} baseHref="/cars" />
          </State>
        </div>
      </Section>

      <Section id="card-slot" title="CarCard — место под избранное">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <State label="слот занят заглушкой (избранное — позже)">
            <CarCard
              listing={OK}
              href="#"
              usdKgsRate={FIXTURE_USD_KGS_RATE}
              now={FIXTURE_NOW}
              favoriteSlot={
                <Button
                  variant="secondary"
                  iconOnly
                  iconLeading={Heart}
                  aria-label="Добавить в избранное"
                  isDisabled
                />
              }
            />
          </State>
        </div>
      </Section>
    </>
  );
}
