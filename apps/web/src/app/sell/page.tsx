import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";

export const metadata: Metadata = {
  title: "Подать объявление",
  robots: { index: false, follow: true },
};

/** Placeholder: posting needs Telegram login, which comes in a later step. */
export default function SellPage() {
  return (
    <main className="mx-auto flex w-full max-w-content flex-1 flex-col justify-center px-4 py-12">
      <EmptyState
        headingLevel={1}
        icon={Clock}
        title="Подать объявление пока нельзя"
        description="Скоро здесь можно будет подать объявление."
        actions={
          <LinkButton href="/cars" variant="secondary">
            Смотреть объявления
          </LinkButton>
        }
      />
    </main>
  );
}
