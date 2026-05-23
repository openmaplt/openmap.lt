export const CATEGORY = {
  ALL: "Visi",
  HISTORY: "Istorija ir paveldas",
  TOURISM: "Turizmas ir poilsis",
  FOOD: "Maitinimas ir pramogos",
  SERVICES: "Paslaugos ir įstaigos",
  SHOPPING: "Prekyba",
  WORSHIP: "Maldos namai",
} as const;

export type Category = (typeof CATEGORY)[keyof typeof CATEGORY];

export const CATEGORIES = Object.values(CATEGORY);

export interface MappingRule {
  type: string;
  icon: string;
  condition: string;
  category: Category;
}

export const MAPPING_RULES: MappingRule[] = [
  // Istorija ir paveldas
  {
    type: "Piliakalniai",
    icon: "HIL",
    condition:
      "historic = 'archaeological_site' and site_type = 'fortification'",
    category: CATEGORY.HISTORY,
  },
  {
    type: "Paveldas",
    icon: "HER",
    condition: `"ref:lt:kpd" is not null and (coalesce(historic, '@') != 'archaeological_site' or coalesce(site_type, '@') != 'fortification')`,
    category: CATEGORY.HISTORY,
  },
  {
    type: "Pilkapiai",
    icon: "TUM",
    condition: "historic = 'archaeological_site' and site_type = 'tumulus'",
    category: CATEGORY.HISTORY,
  },
  {
    type: "Dvarai",
    icon: "MAN",
    condition: "historic = 'manor'",
    category: CATEGORY.HISTORY,
  },
  {
    type: "Kiti istoriniai",
    icon: "HIS",
    condition:
      "historic is not null and historic not in ('monument', 'memorial', 'wayside_cross', 'wayside_shrine', 'manor') and (historic != 'archaeological_site' or site_type not in ('fortification', 'tumulus'))",
    category: CATEGORY.HISTORY,
  },
  {
    type: "Vienuolynai",
    icon: "MNS",
    condition: "historic = 'monastery'",
    category: CATEGORY.HISTORY,
  },

  // Turizmas ir poilsis
  {
    type: "Turizmo informacija",
    icon: "INF",
    condition: "tourism = 'information'",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Lankytinos vietos",
    icon: "ATT",
    condition:
      "tourism = 'attraction' and historic is null and \"attraction:type\" is null",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Vaizdingos vietos",
    icon: "VIE",
    condition: "tourism = 'viewpoint' and historic is null",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Pažintiniai takai",
    icon: "HIK",
    condition:
      "tourism = 'attraction' and \"attraction:type\" = 'hiking_route'",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Bokštai",
    icon: "TOW",
    condition:
      "man_made in ('tower', 'communications_tower') and \"tower:type\" is not null and tourism in ('attraction', 'viewpoint', 'museum') and coalesce(access, 'yes') != 'no'",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Poilsiavietės su laužaviete",
    icon: "PIF",
    condition:
      "(tourism = 'picnic_site' or amenity = 'shelter') and fireplace = 'yes'",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Poilsiavietės be laužavietės",
    icon: "PIC",
    condition:
      "(tourism = 'picnic_site' or amenity = 'shelter') and (fireplace is null or fireplace = 'no')",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Stovyklavietės",
    icon: "CAM",
    condition: "tourism in ('camp_site', 'caravan_site')",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Muziejai",
    icon: "MUS",
    condition: "tourism = 'museum'",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Hosteliai",
    icon: "GUE",
    condition: "tourism in ('chalet', 'hostel', 'motel', 'guest_house')",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Viešbučiai",
    icon: "HOT",
    condition: "tourism = 'hotel'",
    category: CATEGORY.TOURISM,
  },

  // Maitinimas ir pramogos
  {
    type: "Kavinės",
    icon: "CAF",
    condition: "amenity = 'cafe'",
    category: CATEGORY.FOOD,
  },
  {
    type: "Greitas maistas",
    icon: "FAS",
    condition: "amenity = 'fast_food'",
    category: CATEGORY.FOOD,
  },
  {
    type: "Restoranai",
    icon: "RES",
    condition: "amenity = 'restaurant'",
    category: CATEGORY.FOOD,
  },
  {
    type: "Aludės, barai",
    icon: "PUB",
    condition: "amenity in ('pub', 'bar')",
    category: CATEGORY.FOOD,
  },
  {
    type: "Teatrai",
    icon: "THE",
    condition: "amenity = 'theatre'",
    category: CATEGORY.FOOD,
  },
  {
    type: "Kino teatrai",
    icon: "CIN",
    condition: "amenity = 'cinema'",
    category: CATEGORY.FOOD,
  },
  {
    type: "Meno centrai",
    icon: "ART",
    condition: "amenity = 'arts_centre'",
    category: CATEGORY.FOOD,
  },

  // Paslaugos ir įstaigos
  {
    type: "Degalinės",
    icon: "FUE",
    condition: "amenity = 'fuel'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Greičio kameros",
    icon: "SPE",
    condition: "highway = 'speed_camera'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Plovyklos",
    icon: "WAS",
    condition: "amenity = 'car_wash'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Servisai",
    icon: "CAR",
    condition: "shop = 'car_repair'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Valstybinės įstaigos",
    icon: "",
    condition: "office = 'government' or amenity = 'townhall'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Teismai",
    icon: "",
    condition: "amenity = 'courthouse'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Paštai",
    icon: "POS",
    condition: "amenity = 'post_office'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Notarai, antstoliai",
    icon: "",
    condition: "office in ('notary', 'lawyer')",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Policija",
    icon: "",
    condition: "amenity = 'police'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Kitos įmonės",
    icon: "",
    condition:
      "office is not null and office not in ('government', 'notary', 'lawyer', 'insurance')",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Bankai",
    icon: "BAN",
    condition: "amenity = 'bank'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Draudimas",
    icon: "",
    condition: "office = 'insurance'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Bankomatai",
    icon: "ATM",
    condition: "amenity = 'atm'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Ligoninės",
    icon: "",
    condition: "amenity = 'hospital'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Klinikos",
    icon: "",
    condition: "amenity = 'clinic'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Odontologija",
    icon: "",
    condition: "amenity = 'dentist'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Daktarai",
    icon: "",
    condition: "amenity = 'doctors'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Vaistinės",
    icon: "PHA",
    condition: "amenity = 'pharmacy'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Bibliotekos",
    icon: "LIB",
    condition: "amenity = 'library'",
    category: CATEGORY.SERVICES,
  },

  // Prekyba
  {
    type: "Prekybos centrai",
    icon: "SUP",
    condition: "shop in ('supermarket', 'mall')",
    category: CATEGORY.SHOPPING,
  },
  {
    type: "Parduotuvės",
    icon: "",
    condition: "shop = 'convenience'",
    category: CATEGORY.SHOPPING,
  },
  {
    type: "Kioskai",
    icon: "",
    condition: "shop = 'kiosk'",
    category: CATEGORY.SHOPPING,
  },
  {
    type: "Pasidaryk pats",
    icon: "DIY",
    condition: "shop = 'doityourself'",
    category: CATEGORY.SHOPPING,
  },
  {
    type: "Kitos parduotuvės",
    icon: "",
    condition:
      "shop is not null and shop not in ('supermarket', 'mall', 'convenience', 'car_repair', 'kiosk', 'doityourself')",
    category: CATEGORY.SHOPPING,
  },

  // Maldos namai
  {
    type: "Katalikų bažnyčios",
    icon: "CHU",
    condition:
      "amenity = 'place_of_worship' and religion = 'christian' and denomination in ('catholic', 'roman_catholic')",
    category: CATEGORY.WORSHIP,
  },
  {
    type: "Evangelikų bažnyčios",
    icon: "LUT",
    condition:
      "amenity = 'place_of_worship' and religion = 'christian' and denomination in ('lutheran', 'evangelical', 'reformed')",
    category: CATEGORY.WORSHIP,
  },
  {
    type: "Cerkvės",
    icon: "ORT",
    condition:
      "amenity = 'place_of_worship' and religion = 'christian' and denomination in ('orthodox', 'old_believers')",
    category: CATEGORY.WORSHIP,
  },
  {
    type: "Kitų religijų maldos namai",
    icon: "ORE",
    condition:
      "amenity = 'place_of_worship' and (religion != 'christian' or coalesce(denomination, '@') not in ('catholic', 'roman_catholic', 'lutheran', 'evangelical', 'reformed', 'orthodox', 'old_believers'))",
    category: CATEGORY.WORSHIP,
  },
];
