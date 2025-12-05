import { Beer } from "lucide-react";
import type * as React from "react";

export type FilterItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

export const CRAFTBEER_FILTERS: FilterItem[] = [
  { id: "lager", label: "Lageris", icon: Beer },
  { id: "ale", label: "Elis", icon: Beer },
  { id: "wheat", label: "Kvietinis", icon: Beer },
  { id: "ipa", label: "IPA", icon: Beer },
  { id: "and", label: "IR/ARBA", icon: Beer },
  { id: "pub", label: "Gerti/išsinešti", icon: Beer },
];
