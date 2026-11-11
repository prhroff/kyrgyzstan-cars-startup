import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { LinkButton } from "@/components/ui/LinkButton";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <InfoPage title="Вход" lead="Вход через Telegram появится позже.">
      <div>
        <LinkButton href="/cars" variant="secondary">
          Смотреть объявления
        </LinkButton>
      </div>
    </InfoPage>
  );
}
