"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form } from "react-aria-components";
import { Button } from "@/components/ui/Button";
import type { MakeOption } from "@/components/ui/FilterPanel";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EMPTY_FILTERS, parseIntegerInput } from "@/lib/filters";
import { catalogQueryString } from "@/lib/search-params";

const ANY = "__any";

/** Home search: make, model, max price → the catalog URL with the same filters. */
export function HomeSearch({ makes }: { makes: readonly MakeOption[] }) {
  const router = useRouter();
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [priceTo, setPriceTo] = useState("");
  const models = makes.find((m) => m.id === make)?.models ?? [];

  return (
    <Form
      aria-label="Поиск объявлений"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const qs = catalogQueryString({
          filters: { ...EMPTY_FILTERS, make, model, priceTo: parseIntegerInput(priceTo) },
        });
        router.push(`/cars${qs}`);
      }}
    >
      <Select
        label="Марка"
        options={[{ id: ANY, label: "Любая" }, ...makes]}
        value={make ?? ANY}
        onChange={(key) => {
          setMake(key === null || key === ANY ? null : String(key));
          setModel(null);
        }}
      />
      <Select
        label="Модель"
        isDisabled={make === null}
        options={[{ id: ANY, label: "Любая" }, ...models]}
        value={model ?? ANY}
        onChange={(key) => {
          setModel(key === null || key === ANY ? null : String(key));
        }}
      />
      <Input
        label="Цена до"
        suffix="$"
        inputMode="numeric"
        placeholder="Любая"
        value={priceTo}
        onChange={setPriceTo}
      />
      <Button type="submit" iconLeading={Search} fullWidth>
        Показать объявления
      </Button>
    </Form>
  );
}
