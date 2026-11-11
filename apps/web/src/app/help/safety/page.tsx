import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";

export const metadata: Metadata = {
  title: "Как не попасть на мошенников",
  robots: { index: false, follow: true },
};

const TIPS = [
  "Не переводите предоплату до осмотра машины — даже за «бронь».",
  "Осмотрите машину вживую и проверьте её на СТО перед покупкой.",
  "Сверьте VIN в объявлении, в документах и на кузове.",
  "Попросите показать техпаспорт и документы о растаможке.",
  "Встречайтесь днём, в людном месте; деньги передавайте после оформления документов.",
  "Если вас торопят с решением — возьмите паузу. Покупка машины — серьёзное решение.",
];

export default function SafetyPage() {
  return (
    <InfoPage
      title="Как не попасть на мошенников"
      lead="Несколько правил, которые помогают купить машину спокойно."
    >
      <ol className="flex list-decimal flex-col gap-3 pl-6">
        {TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ol>
      <p className="text-fg-muted">
        Мы не осматриваем машины и не участвуем в сделке. В объявлении мы показываем, что известно о
        машине и продавце, и где это найдено.
      </p>
    </InfoPage>
  );
}
