type BeerStyles = {
  label: string;
  value: string;
};

export type CraftbeerFilters = {
  styles: string[];
  condition: "any" | "all";
  venue: "drink" | "shop";
};

export const beerStyles: BeerStyles[] = [
  {
    label: "Lageris",
    value: "lager",
  },
  {
    label: "Elis",
    value: "ale",
  },
  {
    label: "Kvietinis",
    value: "wheat",
  },
  {
    label: "Stautas",
    value: "stout",
  },
  {
    label: "IPA",
    value: "ipa",
  },
];
