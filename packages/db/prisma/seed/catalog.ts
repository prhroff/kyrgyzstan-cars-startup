/**
 * Top makes of the Kyrgyz market with their main models.
 * `aliases` = spellings seen in ads (Cyrillic, slang) — parsers match against them.
 * Generations are listed for the most traded models only; extend as needed.
 */

export interface GenerationSeed {
  code: string;
  yearFrom: number;
  yearTo?: number;
}

export interface ModelSeed {
  name: string;
  aliases?: string[];
  generations?: GenerationSeed[];
}

export interface MakeSeed {
  name: string;
  aliases: string[];
  models: (string | ModelSeed)[];
}

const g = (code: string, yearFrom: number, yearTo?: number): GenerationSeed =>
  yearTo === undefined ? { code, yearFrom } : { code, yearFrom, yearTo };

export const CATALOG: MakeSeed[] = [
  {
    name: "Toyota",
    aliases: ["тойота", "таета", "тоета"],
    models: [
      {
        name: "Camry",
        aliases: ["камри", "камр"],
        generations: [
          g("XV40", 2006, 2011),
          g("XV50", 2011, 2017),
          g("XV70", 2017, 2024),
          g("XV80", 2024),
        ],
      },
      { name: "Corolla", aliases: ["королла", "карола"] },
      {
        name: "RAV4",
        aliases: ["рав4", "рав 4", "рав"],
        generations: [g("XA30", 2005, 2012), g("XA40", 2012, 2018), g("XA50", 2018)],
      },
      {
        name: "Land Cruiser",
        aliases: ["ленд крузер", "крузак", "лк"],
        generations: [g("J100", 1998, 2007), g("J200", 2007, 2021), g("J300", 2021)],
      },
      {
        name: "Land Cruiser Prado",
        aliases: ["прадо", "прадик"],
        generations: [g("J120", 2002, 2009), g("J150", 2009, 2024), g("J250", 2024)],
      },
      {
        name: "Highlander",
        aliases: ["хайлендер"],
        generations: [g("XU40", 2007, 2013), g("XU50", 2013, 2019), g("XU70", 2019)],
      },
      {
        name: "Prius",
        aliases: ["приус"],
        generations: [
          g("XW20", 2003, 2009),
          g("XW30", 2009, 2015),
          g("XW50", 2015, 2022),
          g("XW60", 2022),
        ],
      },
      {
        name: "Alphard",
        aliases: ["альфард"],
        generations: [g("AH20", 2008, 2015), g("AH30", 2015, 2023), g("AH40", 2023)],
      },
      { name: "Estima", aliases: ["эстима"] },
      { name: "Sienna", aliases: ["сиенна"] },
      { name: "Hilux", aliases: ["хайлюкс"] },
      { name: "Venza", aliases: ["венза"] },
      { name: "Crown", aliases: ["краун"] },
      { name: "4Runner", aliases: ["4раннер", "фораннер"] },
      { name: "Sequoia", aliases: ["секвойя"] },
      { name: "Tundra", aliases: ["тундра"] },
      { name: "bZ4X" },
    ],
  },
  {
    name: "Lexus",
    aliases: ["лексус"],
    models: [
      {
        name: "RX",
        aliases: ["рх", "rx350", "rx300", "rx450h"],
        generations: [
          g("XU30", 2003, 2008),
          g("AL10", 2008, 2015),
          g("AL20", 2015, 2022),
          g("AL30", 2022),
        ],
      },
      {
        name: "LX",
        aliases: ["лх", "lx570", "lx470", "lx600"],
        generations: [g("J100", 1998, 2007), g("J200", 2007, 2021), g("J300", 2021)],
      },
      {
        name: "GX",
        aliases: ["гх", "gx460", "gx470"],
        generations: [g("J120", 2002, 2009), g("J150", 2009, 2023), g("J250", 2023)],
      },
      { name: "ES", aliases: ["es350", "es250"] },
      { name: "NX", aliases: ["nx200", "nx300"] },
      { name: "LS", aliases: ["ls460", "ls500"] },
      { name: "IS" },
      { name: "GS" },
      { name: "UX" },
    ],
  },
  {
    name: "Hyundai",
    aliases: ["хендай", "хундай", "хюндай", "хендэ"],
    models: [
      {
        name: "Sonata",
        aliases: ["соната"],
        generations: [
          g("NF", 2004, 2009),
          g("YF", 2009, 2014),
          g("LF", 2014, 2019),
          g("DN8", 2019),
        ],
      },
      {
        name: "Elantra",
        aliases: ["элантра", "avante", "аванте"],
        generations: [
          g("HD", 2006, 2010),
          g("MD", 2010, 2015),
          g("AD", 2015, 2020),
          g("CN7", 2020),
        ],
      },
      {
        name: "Tucson",
        aliases: ["туксон", "тусан", "ix35"],
        generations: [g("LM", 2009, 2015), g("TL", 2015, 2020), g("NX4", 2020)],
      },
      {
        name: "Santa Fe",
        aliases: ["санта фе", "сантафе"],
        generations: [
          g("CM", 2006, 2012),
          g("DM", 2012, 2018),
          g("TM", 2018, 2023),
          g("MX5", 2023),
        ],
      },
      { name: "Accent", aliases: ["акцент", "solaris", "солярис"] },
      { name: "Grandeur", aliases: ["грандер", "грандеур"] },
      { name: "Palisade", aliases: ["палисад"] },
      { name: "Starex", aliases: ["старекс", "h-1", "h1"] },
      { name: "Staria", aliases: ["стария"] },
      { name: "Porter", aliases: ["портер"] },
      { name: "Ioniq 5", aliases: ["ионик 5"] },
      { name: "Getz", aliases: ["гетц"] },
      { name: "Creta", aliases: ["крета"] },
    ],
  },
  {
    name: "Kia",
    aliases: ["киа", "кия"],
    models: [
      {
        name: "K5",
        aliases: ["к5", "optima", "оптима"],
        generations: [g("TF", 2010, 2015), g("JF", 2015, 2019), g("DL3", 2019)],
      },
      {
        name: "Sorento",
        aliases: ["соренто"],
        generations: [g("XM", 2009, 2014), g("UM", 2014, 2020), g("MQ4", 2020)],
      },
      {
        name: "Sportage",
        aliases: ["спортейдж", "спортаж"],
        generations: [g("SL", 2010, 2015), g("QL", 2015, 2021), g("NQ5", 2021)],
      },
      { name: "Rio", aliases: ["рио"] },
      { name: "K7", aliases: ["к7", "cadenza"] },
      { name: "K8", aliases: ["к8"] },
      { name: "Carnival", aliases: ["карнивал"] },
      { name: "Morning", aliases: ["морнинг", "picanto", "пиканто"] },
      { name: "Ray", aliases: ["рей"] },
      { name: "Seltos", aliases: ["селтос"] },
      { name: "Cerato", aliases: ["церато", "k3", "к3"] },
      { name: "Mohave", aliases: ["мохаве"] },
      { name: "EV6" },
    ],
  },
  {
    name: "Honda",
    aliases: ["хонда"],
    models: [
      {
        name: "CR-V",
        aliases: ["срв", "црв", "crv"],
        generations: [g("RE", 2006, 2011), g("RM", 2011, 2016), g("RW", 2016, 2022), g("RS", 2022)],
      },
      {
        name: "Fit",
        aliases: ["фит", "jazz", "джаз"],
        generations: [g("GD", 2001, 2007), g("GE", 2007, 2013), g("GK", 2013, 2020), g("GR", 2020)],
      },
      { name: "Accord", aliases: ["аккорд"] },
      { name: "Civic", aliases: ["цивик"] },
      { name: "Odyssey", aliases: ["одиссей"] },
      { name: "Stepwgn", aliases: ["степвагон", "stepwagon"] },
      { name: "HR-V", aliases: ["vezel", "везел"] },
      { name: "Elysion", aliases: ["элюзион", "элизион"] },
      { name: "Pilot", aliases: ["пилот"] },
      { name: "Insight", aliases: ["инсайт"] },
    ],
  },
  {
    name: "Mercedes-Benz",
    aliases: ["мерседес", "мерс", "mercedes", "benz", "бенц"],
    models: [
      { name: "C-Class", aliases: ["c-класс", "ц класс", "w205", "w204"] },
      {
        name: "E-Class",
        aliases: ["e-класс", "е класс", "ешка"],
        generations: [
          g("W211", 2002, 2009),
          g("W212", 2009, 2016),
          g("W213", 2016, 2023),
          g("W214", 2023),
        ],
      },
      {
        name: "S-Class",
        aliases: ["s-класс", "с класс"],
        generations: [g("W221", 2005, 2013), g("W222", 2013, 2020), g("W223", 2020)],
      },
      { name: "GLE", aliases: ["ml", "мл"] },
      { name: "GLS", aliases: ["gl"] },
      { name: "G-Class", aliases: ["гелик", "гелендваген", "g-класс"] },
      { name: "GLC" },
      { name: "CLS" },
      { name: "Sprinter", aliases: ["спринтер"] },
      { name: "V-Class", aliases: ["вито", "vito"] },
    ],
  },
  {
    name: "BMW",
    aliases: ["бмв", "бэха"],
    models: [
      { name: "3 Series", aliases: ["3 серия"] },
      {
        name: "5 Series",
        aliases: ["5 серия"],
        generations: [
          g("E60", 2003, 2010),
          g("F10", 2010, 2017),
          g("G30", 2017, 2023),
          g("G60", 2023),
        ],
      },
      { name: "7 Series", aliases: ["7 серия"] },
      { name: "X3", aliases: ["х3"] },
      {
        name: "X5",
        aliases: ["х5"],
        generations: [g("E70", 2006, 2013), g("F15", 2013, 2018), g("G05", 2018)],
      },
      { name: "X6", aliases: ["х6"] },
      { name: "X7", aliases: ["х7"] },
    ],
  },
  {
    name: "Chevrolet",
    aliases: ["шевроле", "шевролет", "шеви"],
    models: [
      { name: "Malibu", aliases: ["малибу"] },
      { name: "Cobalt", aliases: ["кобальт"] },
      { name: "Spark", aliases: ["спарк"] },
      { name: "Lacetti", aliases: ["лачетти"] },
      { name: "Captiva", aliases: ["каптива"] },
      { name: "Tracker", aliases: ["трекер"] },
      { name: "Equinox", aliases: ["эквинокс"] },
      { name: "Onix", aliases: ["оникс"] },
      { name: "Tahoe", aliases: ["тахо"] },
    ],
  },
  {
    name: "Daewoo",
    aliases: ["дэу", "деу", "дэо"],
    models: [
      { name: "Matiz", aliases: ["матиз"] },
      { name: "Nexia", aliases: ["нексия"] },
      { name: "Gentra", aliases: ["джентра", "жентра"] },
      { name: "Lacetti", aliases: ["лачетти"] },
      { name: "Damas", aliases: ["дамас"] },
      { name: "Labo", aliases: ["лабо"] },
      { name: "Lanos", aliases: ["ланос"] },
    ],
  },
  {
    name: "BYD",
    aliases: ["бид", "биди", "бвд"],
    models: [
      { name: "Song Plus", aliases: ["сонг плюс"] },
      { name: "Song L", aliases: ["сонг л"] },
      { name: "Han", aliases: ["хан"] },
      { name: "Seal", aliases: ["сил"] },
      { name: "Tang", aliases: ["танг"] },
      { name: "Qin Plus", aliases: ["цин плюс"] },
      { name: "Yuan Plus", aliases: ["юань плюс", "atto 3"] },
      { name: "Seagull", aliases: ["сигал", "сигалл"] },
      { name: "Destroyer 05" },
    ],
  },
  {
    name: "Zeekr",
    aliases: ["зикр", "зекр"],
    models: [
      { name: "001", aliases: ["зикр 001"] },
      { name: "7X" },
      { name: "X" },
      { name: "009" },
      { name: "007" },
    ],
  },
  {
    name: "Li Auto",
    aliases: ["лисян", "ли авто", "lixiang", "li xiang", "лисянь"],
    models: [
      { name: "L6" },
      { name: "L7" },
      { name: "L8" },
      { name: "L9" },
      { name: "Mega", aliases: ["мега"] },
    ],
  },
  {
    name: "Changan",
    aliases: ["чанган", "чанъань"],
    models: [
      { name: "CS35 Plus" },
      { name: "CS55 Plus" },
      { name: "CS75 Plus" },
      { name: "UNI-K", aliases: ["юни-к", "uni k"] },
      { name: "UNI-V", aliases: ["юни-в", "uni v"] },
      { name: "UNI-T", aliases: ["юни-т", "uni t"] },
      { name: "Eado", aliases: ["эадо"] },
    ],
  },
  {
    name: "Chery",
    aliases: ["чери"],
    models: [
      { name: "Tiggo 4 Pro", aliases: ["тигго 4"] },
      { name: "Tiggo 7 Pro", aliases: ["тигго 7"] },
      { name: "Tiggo 8 Pro", aliases: ["тигго 8"] },
      { name: "Arrizo 8", aliases: ["арризо 8"] },
    ],
  },
  {
    name: "Geely",
    aliases: ["джили", "джелли"],
    models: [
      { name: "Monjaro", aliases: ["монджаро"] },
      { name: "Coolray", aliases: ["кулрей"] },
      { name: "Atlas", aliases: ["атлас"] },
      { name: "Tugella", aliases: ["тугелла"] },
      { name: "Emgrand", aliases: ["эмгранд"] },
      { name: "Galaxy E5" },
    ],
  },
  {
    name: "Nissan",
    aliases: ["ниссан"],
    models: [
      { name: "Altima", aliases: ["альтима"] },
      { name: "X-Trail", aliases: ["икстрейл", "х-трейл"] },
      { name: "Patrol", aliases: ["патрол"] },
      { name: "Leaf", aliases: ["лиф"] },
      { name: "Juke", aliases: ["жук"] },
      { name: "Murano", aliases: ["мурано"] },
      { name: "Teana", aliases: ["теана"] },
      { name: "Note", aliases: ["ноут"] },
    ],
  },
  {
    name: "Mitsubishi",
    aliases: ["мицубиси", "митсубиси", "мицубиши"],
    models: [
      { name: "Pajero", aliases: ["паджеро"] },
      { name: "Outlander", aliases: ["аутлендер"] },
      { name: "Delica", aliases: ["делика"] },
      { name: "L200" },
      { name: "Lancer", aliases: ["лансер"] },
      { name: "Eclipse Cross", aliases: ["эклипс кросс"] },
    ],
  },
  {
    name: "Mazda",
    aliases: ["мазда"],
    models: [
      { name: "Mazda3", aliases: ["мазда 3"] },
      { name: "Mazda6", aliases: ["мазда 6"] },
      { name: "CX-5", aliases: ["сх-5", "cx5"] },
      { name: "CX-9", aliases: ["сх-9", "cx9"] },
      { name: "Demio", aliases: ["демио"] },
      { name: "MPV" },
    ],
  },
  {
    name: "Subaru",
    aliases: ["субару"],
    models: [
      { name: "Forester", aliases: ["форестер"] },
      { name: "Outback", aliases: ["аутбэк", "аутбек"] },
      { name: "Legacy", aliases: ["легаси"] },
      { name: "Impreza", aliases: ["импреза"] },
      { name: "XV" },
    ],
  },
  {
    name: "Volkswagen",
    aliases: ["фольксваген", "фольц", "vw"],
    models: [
      { name: "Passat", aliases: ["пассат"] },
      { name: "Golf", aliases: ["гольф"] },
      { name: "Jetta", aliases: ["джетта"] },
      { name: "Tiguan", aliases: ["тигуан"] },
      { name: "Touareg", aliases: ["туарег"] },
      { name: "ID.4", aliases: ["id4"] },
      { name: "ID.6", aliases: ["id6"] },
    ],
  },
  {
    name: "Audi",
    aliases: ["ауди"],
    models: [
      { name: "A4", aliases: ["а4"] },
      { name: "A6", aliases: ["а6"] },
      { name: "A8", aliases: ["а8"] },
      { name: "Q5", aliases: ["ку5"] },
      { name: "Q7", aliases: ["ку7"] },
      { name: "Q8", aliases: ["ку8"] },
    ],
  },
  {
    name: "Ford",
    aliases: ["форд"],
    models: [
      { name: "Focus", aliases: ["фокус"] },
      { name: "Fusion", aliases: ["фьюжн"] },
      { name: "Escape", aliases: ["эскейп"] },
      { name: "Explorer", aliases: ["эксплорер"] },
      { name: "Mustang", aliases: ["мустанг"] },
    ],
  },
  {
    name: "Land Rover",
    aliases: ["ленд ровер", "лендровер"],
    models: [
      { name: "Range Rover", aliases: ["рендж ровер", "ренж"] },
      { name: "Range Rover Sport", aliases: ["рендж ровер спорт"] },
      { name: "Range Rover Velar", aliases: ["велар"] },
      { name: "Range Rover Evoque", aliases: ["эвок"] },
      { name: "Discovery", aliases: ["дискавери"] },
      { name: "Defender", aliases: ["дефендер"] },
    ],
  },
  {
    name: "Porsche",
    aliases: ["порше"],
    models: [
      { name: "Cayenne", aliases: ["кайен"] },
      { name: "Macan", aliases: ["макан"] },
      { name: "Panamera", aliases: ["панамера"] },
      { name: "911" },
      { name: "Taycan", aliases: ["тайкан"] },
    ],
  },
  {
    name: "Infiniti",
    aliases: ["инфинити"],
    models: [
      { name: "QX80" },
      { name: "QX56" },
      { name: "QX60" },
      { name: "QX50" },
      { name: "FX35", aliases: ["fx", "фх"] },
    ],
  },
  {
    name: "Haval",
    aliases: ["хавал", "хавейл"],
    models: [
      { name: "Jolion", aliases: ["джолион"] },
      { name: "H6" },
      { name: "Dargo", aliases: ["дарго"] },
      { name: "F7" },
      { name: "H9" },
    ],
  },
  {
    name: "Tesla",
    aliases: ["тесла"],
    models: [
      { name: "Model 3", aliases: ["модель 3"] },
      { name: "Model Y", aliases: ["модель y"] },
      { name: "Model S", aliases: ["модель s"] },
      { name: "Model X", aliases: ["модель x"] },
    ],
  },
  {
    name: "Lada",
    aliases: ["лада", "ваз", "vaz", "жигули"],
    models: [
      { name: "2106", aliases: ["шестерка"] },
      { name: "2107", aliases: ["семерка"] },
      { name: "Niva", aliases: ["нива", "4x4", "2121"] },
      { name: "Granta", aliases: ["гранта"] },
      { name: "Vesta", aliases: ["веста"] },
      { name: "Priora", aliases: ["приора"] },
    ],
  },
  {
    name: "Genesis",
    aliases: ["генезис"],
    models: [{ name: "G70" }, { name: "G80" }, { name: "G90" }, { name: "GV70" }, { name: "GV80" }],
  },
  {
    name: "SsangYong",
    aliases: ["ссангйонг", "санг енг", "kgm"],
    models: [
      { name: "Rexton", aliases: ["рекстон"] },
      { name: "Actyon", aliases: ["актион"] },
      { name: "Kyron", aliases: ["кайрон"] },
      { name: "Korando", aliases: ["корандо"] },
      { name: "Tivoli", aliases: ["тиволи"] },
    ],
  },
];
