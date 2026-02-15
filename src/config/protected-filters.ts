export type FilterItem = {
  id: string;
  label: string;
  layers: string[];
};

export const PROTECTED_FILTERS: FilterItem[] = [
  {
    id: "rzv",
    label: "Rezervatai",
    layers: [
      "stvk-rezervatai",
      "stvk-rezervatai-hash",
      "stvk-rezervatai-label",
    ],
  },
  {
    id: "dra",
    label: "Draustiniai",
    layers: [
      "stvk-draustiniai",
      "stvk-draustiniai-hash",
      "stvk-draustiniai-label",
    ],
  },
  {
    id: "npa",
    label: "Nacionaliniai parkai",
    layers: [
      "stvk-nacionaliniai",
      "stvk-nacionaliniai-hash",
      "stvk-nacionaliniai-label",
    ],
  },
  {
    id: "rpa",
    label: "Regioniniai parkai",
    layers: [
      "stvk-regioniniai",
      "stvk-regioniniai-hash",
      "stvk-regioniniai-label",
    ],
  },
  {
    id: "gpo",
    label: "Gamtos paveldo objektai",
    layers: [
      "stvk-gpo-t",
      "stvk-gpo",
      "stvk-gpo-outline",
      "gpo-label",
      "gpo-label-c",
    ],
  },
];

export const PROTECTED_ACTIVE_LAYERS: string[] = [
  "stvk-rezervatai-hash",
  "stvk-draustiniai-hash",
  "stvk-nacionaliniai-hash",
  "stvk-regioniniai-hash",
  "stvk-gpo",
  "stvk-gpo-t",
];
