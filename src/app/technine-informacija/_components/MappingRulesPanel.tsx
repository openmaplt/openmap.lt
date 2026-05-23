"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import {
  CATEGORIES,
  CATEGORY,
  type Category,
  MAPPING_RULES,
} from "../_data/mapping-rules";
import { CategoryFilter } from "./CategoryFilter";
import { MappingRulesTable } from "./MappingRulesTable";

export function MappingRulesPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Category>(CATEGORY.ALL);

  const filteredRules = MAPPING_RULES.filter((rule) => {
    const matchesSearch =
      rule.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === CATEGORY.ALL || rule.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col gap-4 bg-card border rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Ieškoti pagal tipą arba sąlygą..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      <CategoryFilter
        categories={CATEGORIES}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <MappingRulesTable rules={filteredRules} />
    </div>
  );
}
