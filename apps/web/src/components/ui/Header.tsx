"use client";

import { Menu, Plus, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Dialog, DialogTrigger, Heading, Link, Modal, ModalOverlay } from "react-aria-components";
import { CityPicker } from "@/components/layout/CityPicker";
import { SearchBar } from "@/components/layout/SearchBar";
import type { MakeOptionData } from "@/data/search";
import { ALL_CITIES, resolveCity } from "@/lib/city";
import { cx } from "@/lib/cx";
import { Button } from "./Button";
import { LinkButton } from "./LinkButton";
import { focusRing } from "./styles";

export const SITE_NAME = "Авто КР";

/** Top-strip links. "Для бизнеса" and "Помощь" lead to placeholders for now. */
const TOP_LINKS = [
  { href: "/business", label: "Для бизнеса" },
  { href: "/help", label: "Помощь" },
  { href: "/login", label: "Вход" },
] as const;

export interface HeaderProps {
  makes: readonly MakeOptionData[];
  /** Default city from the cookie; the URL `?city=` wins (resolveCity). */
  cookieCity: string | null;
  className?: string;
}

const textLink = cx("rounded-sm text-sm text-fg-muted ui-hover:text-fg", focusRing);

/**
 * Two levels, like the Avito Auto home: a thin strip (business, help, login, post) and the main row
 * (logo, search, city). Mobile: logo, search, menu.
 */
export function Header({ makes, cookieCity, className }: HeaderProps) {
  const params = useSearchParams();
  const pathname = usePathname();
  // The catalog filters by the URL only (no city = whole country), so the picker must say so there;
  // elsewhere the cookie is the default.
  const resolved = resolveCity(params.get("city"), pathname === "/cars" ? ALL_CITIES : cookieCity);

  return (
    <header className={cx("bg-surface", className)}>
      <div className="hidden border-b border-line lg:block">
        <nav
          aria-label="Сервисные ссылки"
          className="mx-auto flex h-10 max-w-content items-center justify-end gap-6 px-4"
        >
          {TOP_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={textLink}>
              {l.label}
            </Link>
          ))}
          <Link
            href="/sell"
            className={cx(
              "inline-flex items-center gap-1 rounded-sm text-sm font-medium text-fg ui-hover:underline",
              focusRing,
            )}
          >
            <Plus aria-hidden className="size-4" />
            Подать объявление
          </Link>
        </nav>
      </div>

      <div className="mx-auto flex h-16 max-w-content items-center gap-3 px-4 lg:h-20 lg:gap-6">
        <Link
          href="/"
          className={cx(
            "shrink-0 rounded-sm text-xl font-bold tracking-tight text-fg lg:text-2xl",
            focusRing,
          )}
        >
          {SITE_NAME}
        </Link>
        <SearchBar makes={makes} city={resolved.city} className="hidden flex-1 lg:flex" />
        <SearchBar makes={makes} city={resolved.city} compact className="flex-1 lg:hidden" />
        <CityPicker value={resolved.optionId} className="hidden lg:flex" />
        <MobileMenu cityOptionId={resolved.optionId} />
      </div>
    </header>
  );
}

/** Mobile: everything from the top strip plus the city picker, in a sheet. */
function MobileMenu({ cityOptionId }: { cityOptionId: string }) {
  return (
    <DialogTrigger>
      <Button variant="ghost" iconOnly iconLeading={Menu} aria-label="Меню" className="lg:hidden" />
      <ModalOverlay isDismissable className="fixed inset-0 z-50 bg-overlay lg:hidden">
        <Modal className="fixed inset-x-0 bottom-0 rounded-t-xl bg-surface shadow-overlay outline-none">
          <Dialog aria-label="Меню" className="flex flex-col gap-2 p-4 pb-6 outline-none">
            {({ close }) => (
              <>
                <div className="flex items-center justify-between">
                  <Heading slot="title" className="text-lg font-semibold tracking-tight text-fg">
                    Меню
                  </Heading>
                  <Button
                    variant="ghost"
                    iconOnly
                    iconLeading={X}
                    aria-label="Закрыть меню"
                    onPress={close}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 py-1">
                  <span className="text-base text-fg-muted">Город</span>
                  <CityPicker value={cityOptionId} />
                </div>
                <nav aria-label="Сервисные ссылки" className="flex flex-col">
                  {TOP_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onPress={close}
                      className={cx(
                        "flex h-11 items-center rounded-sm text-base text-fg ui-hover:text-accent",
                        focusRing,
                      )}
                    >
                      {l.label}
                    </Link>
                  ))}
                </nav>
                <LinkButton href="/sell" iconLeading={Plus} fullWidth size="lg" className="mt-2">
                  Подать объявление
                </LinkButton>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
