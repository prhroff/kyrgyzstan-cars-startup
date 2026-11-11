import type { RegionType } from "@repo/core";

export interface RegionSeed {
  slug: string;
  nameRu: string;
  nameKy: string;
  type: RegionType;
  cities: { slug: string; nameRu: string; nameKy: string; isRegionalCenter?: boolean }[];
}

/** Bishkek and Osh are cities of republican significance — their own "region". */
export const REGIONS: RegionSeed[] = [
  {
    slug: "bishkek",
    nameRu: "Бишкек",
    nameKy: "Бишкек",
    type: "city",
    cities: [{ slug: "bishkek", nameRu: "Бишкек", nameKy: "Бишкек", isRegionalCenter: true }],
  },
  {
    slug: "osh-city",
    nameRu: "Ош",
    nameKy: "Ош",
    type: "city",
    cities: [{ slug: "osh", nameRu: "Ош", nameKy: "Ош", isRegionalCenter: true }],
  },
  {
    slug: "chui",
    nameRu: "Чуйская область",
    nameKy: "Чүй облусу",
    type: "oblast",
    cities: [
      { slug: "tokmok", nameRu: "Токмок", nameKy: "Токмок", isRegionalCenter: true },
      { slug: "kant", nameRu: "Кант", nameKy: "Кант" },
      { slug: "kara-balta", nameRu: "Кара-Балта", nameKy: "Кара-Балта" },
      { slug: "belovodskoe", nameRu: "Беловодское", nameKy: "Беловодск" },
      { slug: "sokuluk", nameRu: "Сокулук", nameKy: "Сокулук" },
      { slug: "kemin", nameRu: "Кемин", nameKy: "Кемин" },
    ],
  },
  {
    slug: "osh",
    nameRu: "Ошская область",
    nameKy: "Ош облусу",
    type: "oblast",
    cities: [
      { slug: "uzgen", nameRu: "Узген", nameKy: "Өзгөн" },
      { slug: "kara-suu", nameRu: "Кара-Суу", nameKy: "Кара-Суу" },
      { slug: "nookat", nameRu: "Ноокат", nameKy: "Ноокат" },
    ],
  },
  {
    slug: "jalal-abad",
    nameRu: "Джалал-Абадская область",
    nameKy: "Жалал-Абад облусу",
    type: "oblast",
    cities: [
      { slug: "jalal-abad", nameRu: "Джалал-Абад", nameKy: "Жалал-Абад", isRegionalCenter: true },
      { slug: "tash-kumyr", nameRu: "Таш-Кумыр", nameKy: "Таш-Көмүр" },
      { slug: "mailuu-suu", nameRu: "Майлуу-Суу", nameKy: "Майлуу-Суу" },
      { slug: "kara-kul", nameRu: "Кара-Куль", nameKy: "Кара-Көл" },
      { slug: "bazar-korgon", nameRu: "Базар-Коргон", nameKy: "Базар-Коргон" },
    ],
  },
  {
    slug: "issyk-kul",
    nameRu: "Иссык-Кульская область",
    nameKy: "Ысык-Көл облусу",
    type: "oblast",
    cities: [
      { slug: "karakol", nameRu: "Каракол", nameKy: "Каракол", isRegionalCenter: true },
      { slug: "balykchy", nameRu: "Балыкчы", nameKy: "Балыкчы" },
      { slug: "cholpon-ata", nameRu: "Чолпон-Ата", nameKy: "Чолпон-Ата" },
    ],
  },
  {
    slug: "naryn",
    nameRu: "Нарынская область",
    nameKy: "Нарын облусу",
    type: "oblast",
    cities: [
      { slug: "naryn", nameRu: "Нарын", nameKy: "Нарын", isRegionalCenter: true },
      { slug: "kochkor", nameRu: "Кочкор", nameKy: "Кочкор" },
    ],
  },
  {
    slug: "talas",
    nameRu: "Таласская область",
    nameKy: "Талас облусу",
    type: "oblast",
    cities: [{ slug: "talas", nameRu: "Талас", nameKy: "Талас", isRegionalCenter: true }],
  },
  {
    slug: "batken",
    nameRu: "Баткенская область",
    nameKy: "Баткен облусу",
    type: "oblast",
    cities: [
      { slug: "batken", nameRu: "Баткен", nameKy: "Баткен", isRegionalCenter: true },
      { slug: "kyzyl-kiya", nameRu: "Кызыл-Кия", nameKy: "Кызыл-Кыя" },
      { slug: "sulukta", nameRu: "Сулюкта", nameKy: "Сүлүктү" },
      { slug: "isfana", nameRu: "Исфана", nameKy: "Исфана" },
    ],
  },
];
