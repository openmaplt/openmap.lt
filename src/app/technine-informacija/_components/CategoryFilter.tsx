import type { Category } from "../_data/mapping-rules";

interface CategoryFilterProps {
  categories: Category[];
  activeTab: Category;
  onTabChange: (tab: Category) => void;
}

export function CategoryFilter({
  categories,
  activeTab,
  onTabChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5 border-b pb-2 overflow-x-auto scrollbar-none">
      {categories.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === tab
              ? "bg-blue-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
