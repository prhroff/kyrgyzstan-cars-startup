import { History, ScanLine, Scale, UserRound, type LucideIcon } from "lucide-react";
import { HomeSearch } from "@/components/catalog/HomeSearch";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { LinkButton } from "@/components/ui/LinkButton";
import { getLatestListings, getMakeOptions, getNow, getUsdKgsRate } from "@/data/listings";

const LATEST_COUNT = 8;

/** What every listing shows. Facts we provide, no promises (tone of voice, «Доверие»). */
const WHAT_WE_SHOW: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Scale,
    title: "Цена к рынку",
    text: "Сравниваем цену с похожими объявлениями за 30 дней и пишем, со сколькими сравнили.",
  },
  {
    icon: History,
    title: "История цены",
    text: "Каждое изменение цены — с датой. Видно, сколько дней объявление на сайте.",
  },
  {
    icon: UserRound,
    title: "Кто продаёт",
    text: "Частное лицо или дилер, с какого времени на сайте и сколько у продавца объявлений.",
  },
  {
    icon: ScanLine,
    title: "VIN",
    text: "Показываем, указан ли VIN и корректен ли его формат.",
  },
];

export default async function HomePage() {
  const [latest, makes, now, rate] = await Promise.all([
    getLatestListings(LATEST_COUNT),
    getMakeOptions(),
    getNow(),
    getUsdKgsRate(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-content flex-col gap-12 px-4 py-8 lg:py-12">
      <section aria-labelledby="home-heading" className="flex flex-col gap-6">
        <div className="flex max-w-prose flex-col gap-2">
          <h1 id="home-heading" className="text-2xl font-semibold text-fg sm:text-3xl">
            Объявления о продаже авто в Кыргызстане
          </h1>
          <p className="text-base text-fg-muted">
            В каждом объявлении — цена к рынку, история цены и данные о продавце.
          </p>
        </div>
        <HomeSearch makes={makes} />
      </section>

      <section aria-labelledby="latest-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="latest-heading" className="text-xl font-semibold text-fg">
            Свежие объявления
          </h2>
          <LinkButton href="/cars" variant="ghost" size="sm">
            Все объявления
          </LinkButton>
        </div>
        <ListingGrid listings={latest} usdKgsRate={rate} now={now} priorityCount={2} />
      </section>

      <section
        aria-labelledby="trust-heading"
        className="flex flex-col gap-6 border-t border-line pt-10"
      >
        <div className="flex max-w-prose flex-col gap-2">
          <h2 id="trust-heading" className="text-xl font-semibold text-fg">
            Что вы увидите в объявлении
          </h2>
          <p className="text-base text-fg-muted">
            У каждого факта указан источник. Если данных нет, так и пишем.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHAT_WE_SHOW.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-2">
              <Icon aria-hidden className="size-6 text-accent" />
              <h3 className="text-base font-semibold text-fg">{title}</h3>
              <p className="text-sm text-fg-muted">{text}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-fg-muted">
          Мы не осматриваем машины. Перед покупкой проверьте машину на СТО.
        </p>
      </section>
    </main>
  );
}
