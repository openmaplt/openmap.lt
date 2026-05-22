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
  iconName: string;
  condition: string;
  category: Category;
}

export const MAPPING_RULES: MappingRule[] = [
  // Istorija ir paveldas
  {
    type: "Piliakalniai",
    iconName: "hillfort_",
    condition:
      "historic = 'archaeological_site' and site_type = 'fortification'",
    category: CATEGORY.HISTORY,
  },
  {
    type: "Paveldas",
    iconName: "paveldas_",
    condition: `"ref:lt:kpd" is not null and (coalesce(historic, '@') != 'archaeological_site' or coalesce(site_type, '@') != 'fortification')`,
    category: CATEGORY.HISTORY,
  },
  {
    type: "Pilkapiai",
    iconName: "tumulus_",
    condition: "historic = 'archaeological_site' and site_type = 'tumulus'",
    category: CATEGORY.HISTORY,
  },
  {
    type: "Dvarai",
    iconName: "dvarai_",
    condition: "historic = 'manor'",
    category: CATEGORY.HISTORY,
  },
  {
    type: "Kiti istoriniai",
    iconName: "ruins_",
    condition:
      "historic is not null and historic not in ('monument', 'memorial', 'wayside_cross', 'wayside_shrine', 'manor') and (historic != 'archaeological_site' or site_type not in ('fortification', 'tumulus'))",
    category: CATEGORY.HISTORY,
  },
  {
    type: "Vienuolynai",
    iconName: "convent_",
    condition: "historic = 'monastery'",
    category: CATEGORY.HISTORY,
  },

  // Turizmas ir poilsis
  {
    type: "Turizmo informacija",
    iconName: "information_",
    condition: "tourism = 'information'",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Lankytinos vietos",
    iconName: "footprint_",
    condition:
      "tourism = 'attraction' and historic is null and \"attraction:type\" is null",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Vaizdingos vietos",
    iconName: "viewpoint_",
    condition: "tourism = 'viewpoint' and historic is null",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Pažintiniai takai",
    iconName: "hiking_",
    condition:
      "tourism = 'attraction' and \"attraction:type\" = 'hiking_route'",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Bokštai",
    iconName: "tower_",
    condition:
      "man_made in ('tower', 'communications_tower') and \"tower:type\" is not null and tourism in ('attraction', 'viewpoint', 'museum') and coalesce(access, 'yes') != 'no'",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Poilsiavietės su laužaviete",
    iconName: "fire_",
    condition:
      "(tourism = 'picnic_site' or amenity = 'shelter') and fireplace = 'yes'",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Poilsiavietės be laužavietės",
    iconName: "picnic_",
    condition:
      "(tourism = 'picnic_site' or amenity = 'shelter') and (fireplace is null or fireplace = 'no')",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Stovyklavietės",
    iconName: "camping_",
    condition: "tourism in ('camp_site', 'caravan_site')",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Muziejai",
    iconName: "museum_",
    condition: "tourism = 'museum'",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Hosteliai",
    iconName: "hostel_",
    condition: "tourism in ('chalet', 'hostel', 'motel', 'guest_house')",
    category: CATEGORY.TOURISM,
  },
  {
    type: "Viešbučiai",
    iconName: "hotel_",
    condition: "tourism = 'hotel'",
    category: CATEGORY.TOURISM,
  },

  // Maitinimas ir pramogos
  {
    type: "Kavinės",
    iconName: "coffee_",
    condition: "amenity = 'cafe'",
    category: CATEGORY.FOOD,
  },
  {
    type: "Greitas maistas",
    iconName: "burger_",
    condition: "amenity = 'fast_food'",
    category: CATEGORY.FOOD,
  },
  {
    type: "Restoranai",
    iconName: "restaurant_",
    condition: "amenity = 'restaurant'",
    category: CATEGORY.FOOD,
  },
  {
    type: "Aludės, barai",
    iconName: "bar_",
    condition: "amenity in ('pub', 'bar')",
    category: CATEGORY.FOOD,
  },
  {
    type: "Teatrai",
    iconName: "theater_",
    condition: "amenity = 'theatre'",
    category: CATEGORY.FOOD,
  },
  {
    type: "Kino teatrai",
    iconName: "cinema_",
    condition: "amenity = 'cinema'",
    category: CATEGORY.FOOD,
  },
  {
    type: "Meno centrai",
    iconName: "art-museum_",
    condition: "amenity = 'arts_centre'",
    category: CATEGORY.FOOD,
  },

  // Paslaugos ir įstaigos
  {
    type: "Degalinės",
    iconName: "fillingstation_",
    condition: "amenity = 'fuel'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Greičio kameros",
    iconName: "speed_",
    condition: "highway = 'speed_camera'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Plovyklos",
    iconName: "carwash_",
    condition: "amenity = 'car_wash'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Servisai",
    iconName: "repair_",
    condition: "shop = 'car_repair'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Valstybinės įstaigos",
    iconName: "congress_",
    condition: "office = 'government' or amenity = 'townhall'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Teismai",
    iconName: "court_",
    condition: "amenity = 'courthouse'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Paštai",
    iconName: "postal_",
    condition: "amenity = 'post_office'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Notarai, antstoliai",
    iconName: "administration_",
    condition: "office in ('notary', 'lawyer')",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Policija",
    iconName: "police_",
    condition: "amenity = 'police'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Kitos įmonės",
    iconName: "office-building_",
    condition:
      "office is not null and office not in ('government', 'notary', 'lawyer', 'insurance')",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Bankai",
    iconName: "bigcity_",
    condition: "amenity = 'bank'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Draudimas",
    iconName: "umbrella_",
    condition: "office = 'insurance'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Bankomatai",
    iconName: "euro_",
    condition: "amenity = 'atm'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Ligoninės",
    iconName: "hospital_",
    condition: "amenity = 'hospital'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Klinikos",
    iconName: "firstaid_",
    condition: "amenity = 'clinic'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Odontologija",
    iconName: "dentist_",
    condition: "amenity = 'dentist'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Daktarai",
    iconName: "medicine_",
    condition: "amenity = 'doctors'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Vaistinės",
    iconName: "drugstore_",
    condition: "amenity = 'pharmacy'",
    category: CATEGORY.SERVICES,
  },
  {
    type: "Bibliotekos",
    iconName: "library_",
    condition: "amenity = 'library'",
    category: CATEGORY.SERVICES,
  },

  // Prekyba
  {
    type: "Prekybos centrai",
    iconName: "supermarket_",
    condition: "shop in ('supermarket', 'mall')",
    category: CATEGORY.SHOPPING,
  },
  {
    type: "Parduotuvės",
    iconName: "convenience_",
    condition: "shop = 'convenience'",
    category: CATEGORY.SHOPPING,
  },
  {
    type: "Kioskai",
    iconName: "market_",
    condition: "shop = 'kiosk'",
    category: CATEGORY.SHOPPING,
  },
  {
    type: "Pasidaryk pats",
    iconName: "workshop_",
    condition: "shop = 'doityourself'",
    category: CATEGORY.SHOPPING,
  },
  {
    type: "Kitos parduotuvės",
    iconName: "departmentstore_",
    condition:
      "shop is not null and shop not in ('supermarket', 'mall', 'convenience', 'car_repair', 'kiosk', 'doityourself')",
    category: CATEGORY.SHOPPING,
  },

  // Maldos namai
  {
    type: "Katalikų bažnyčios",
    iconName: "cathedral_",
    condition:
      "amenity = 'place_of_worship' and religion = 'christian' and denomination in ('catholic', 'roman_catholic')",
    category: CATEGORY.WORSHIP,
  },
  {
    type: "Evangelikų bažnyčios",
    iconName: "lutheran_",
    condition:
      "amenity = 'place_of_worship' and religion = 'christian' and denomination in ('lutheran', 'evangelical', 'reformed')",
    category: CATEGORY.WORSHIP,
  },
  {
    type: "Cerkvės",
    iconName: "orthodox_",
    condition:
      "amenity = 'place_of_worship' and religion = 'christian' and denomination in ('orthodox', 'old_believers')",
    category: CATEGORY.WORSHIP,
  },
  {
    type: "Kitų religijų maldos namai",
    iconName: "prayer_",
    condition:
      "amenity = 'place_of_worship' and (religion != 'christian' or coalesce(denomination, '@') not in ('catholic', 'roman_catholic', 'lutheran', 'evangelical', 'reformed', 'orthodox', 'old_believers'))",
    category: CATEGORY.WORSHIP,
  },
];
