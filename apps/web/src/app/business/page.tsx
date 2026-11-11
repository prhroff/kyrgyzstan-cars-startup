import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";

export const metadata: Metadata = {
  title: "Для бизнеса",
  robots: { index: false, follow: true },
};

export default function BusinessPage() {
  return (
    <InfoPage
      title="Для бизнеса"
      lead="Страница для дилеров и импортёров появится позже. Сейчас мы подключаем их вручную."
    />
  );
}
