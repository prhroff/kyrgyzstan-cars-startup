import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { LinkButton } from "@/components/ui/LinkButton";

export const metadata: Metadata = {
  title: "Помощь",
  robots: { index: false, follow: true },
};

export default function HelpPage() {
  return (
    <InfoPage title="Помощь" lead="Раздел пока небольшой. Начните с этих страниц.">
      <div className="flex flex-col items-start gap-3">
        <LinkButton href="/help/market-price" variant="secondary">
          Как мы считаем цену к рынку
        </LinkButton>
        <LinkButton href="/help/safety" variant="secondary">
          Как не попасть на мошенников
        </LinkButton>
      </div>
    </InfoPage>
  );
}
