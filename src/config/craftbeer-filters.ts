import { Beer } from "lucide-react";
import type * as React from "react";

export type FilterItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

export const CRAFTBEER_FILTERS: FilterItem[] = [
  { id: "lager", label: "Lager", icon: Beer },
  { id: "ale", label: "Ale", icon: Beer },
  { id: "ipa", label: "IPA", icon: Beer },
];
