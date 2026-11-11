"use client";

import { MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import type { ContactInfo } from "@/data/types";
import { cx } from "@/lib/cx";
import { formatPhone } from "@/lib/format";
import { Button } from "./Button";
import { LinkButton } from "./LinkButton";

export interface ContactActionsProps {
  contacts: ContactInfo;
  /** panel = stacked in the sidebar; bar = one row for the sticky mobile bottom bar. */
  layout?: "panel" | "bar";
  /** Start revealed (showcase). */
  defaultRevealed?: boolean;
  /** Hook for the "открытия телефона" counter (MVP metric), wired with the DB. */
  onReveal?: () => void;
  className?: string;
}

/**
 * "Показать телефон" reveals the number in place and turns into a tel: link.
 * Telegram / WhatsApp open the apps — links, not buttons. WhatsApp shows up after the reveal.
 * TODO(db): fetch the number on reveal (server action) instead of sending it with the page.
 */
export function ContactActions({
  contacts,
  layout = "panel",
  defaultRevealed = false,
  onReveal,
  className,
}: ContactActionsProps) {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const bar = layout === "bar";
  const tg = contacts.telegramUsername ? `https://t.me/${contacts.telegramUsername}` : null;
  const wa = contacts.whatsapp ? `https://wa.me/${contacts.phone.replace(/^\+/, "")}` : null;

  return (
    <div className={cx("flex gap-2", bar ? "flex-row" : "flex-col", className)}>
      {revealed ? (
        <LinkButton
          href={`tel:${contacts.phone}`}
          size="lg"
          iconLeading={Phone}
          fullWidth
          className={cx("tabular-nums", bar && "min-w-0 flex-1")}
        >
          <span className="sr-only">Позвонить: </span>
          {formatPhone(contacts.phone)}
        </LinkButton>
      ) : (
        <Button
          size="lg"
          iconLeading={Phone}
          fullWidth
          className={cx(bar && "min-w-0 flex-1")}
          onPress={() => {
            setRevealed(true);
            onReveal?.();
          }}
        >
          Показать телефон
        </Button>
      )}
      {tg && (
        <LinkButton
          href={tg}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          size="lg"
          iconLeading={Send}
          iconOnly={bar}
          fullWidth={!bar}
          {...(bar ? { "aria-label": "Написать в Telegram" } : {})}
        >
          Написать в Telegram
        </LinkButton>
      )}
      {/* wa.me carries the number, so it appears only after "Показать телефон". */}
      {wa && revealed && (
        <LinkButton
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          size="lg"
          iconLeading={MessageCircle}
          iconOnly={bar}
          fullWidth={!bar}
          {...(bar ? { "aria-label": "Написать в WhatsApp" } : {})}
        >
          Написать в WhatsApp
        </LinkButton>
      )}
    </div>
  );
}
