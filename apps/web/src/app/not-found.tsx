import type { Metadata } from "next";
import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-content flex-1 flex-col justify-center px-4 py-12">
      <EmptyState
        headingLevel={1}
        icon={FileQuestion}
        title="Страница не найдена"
        description="Возможно, ссылка устарела или в ней опечатка."
        actions={
          <>
            <LinkButton href="/cars">Смотреть объявления</LinkButton>
            <LinkButton href="/" variant="secondary">
              На главную
            </LinkButton>
          </>
        }
      />
    </main>
  );
}
