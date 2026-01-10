"use client";

import { type FormEvent, useRef, useState } from "react";
import { beerStyles, type CraftbeerFilters } from "@/config/craftbeer-filters";
import { cn } from "@/lib/utils";

interface ProtectedFilterProps {
  filters: CraftbeerFilters;
  onFiltersChange: (filters: CraftbeerFilters) => void;
}

export function ProtectedFilter({
  filters,
  onFiltersChange,
}: ProtectedFilterProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleCheckboxChange = () => {
    formRef.current?.requestSubmit();
  };

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    onFiltersChange({
      styles: formData.getAll("styles[]"),
      condition: formData.get("condition"),
      venue: formData.get("venue"),
    } as CraftbeerFilters);
  }

  return (
    <div className="absolute top-3 right-3">
      {/* Scoped protected-specific styles */}
      <style>
        {`
        .menu {
          font: 11px/18px 'Helvetica Neue', Arial, Helvetica, sans-serif;
          font-weight: 550;
          color: #fff;
          background: transparent;
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 7px;
          right: 7px;
          padding: 4px;
          width: 120px;
          transition: right 0.5s;
        }
        .menu input[type="checkbox"] + label,
        .menu input[type="radio"] + label {
          background-color: #333333;
          display: block;
          cursor: pointer;
          padding: 7px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.25);
          margin-bottom: 0px;
          text-transform: capitalize;
        }
        .menu input[type="checkbox"]:checked + label,
        .menu input[type="radio"]:checked + label {
          background-color: #fff480;
          color: #000;
        }
        .menu input[type="checkbox"]:checked + label:before,
        .menu input[type="radio"]:checked + label:before {
          content: '✔';
          margin-right: 5px;
        }
        .menu2 {
          display: flex;
          flex-direction: row;
        }
        .menu2 input[type=checkbox] + label,
        .menu2 input[type=radio] + label {
          width: 56px;
        }
        .menu-control {
          font: 11px/18px 'Helvetica Neue', Arial, Helvetica, sans-serif;
          font-weight: 700;
          background-color: #fff480;
          color: #000;
          position: absolute;
          right: 11px;
          top: 285px;
          width: 112px;
          height: 32px;
          border-radius: 7px;
          padding: 7px;
          cursor: pointer;
          transition: top 0.5s;
        }
        .menu-control-top {
          top: 7px;
          transition: top 0.5s;
        }
        .menu-hidden {
          right: -200px;
          transition: right 0.5s;
        }`}
      </style>

      <form
        ref={formRef}
        id="menu"
        onSubmit={handleSubmit}
        className={`menu rounded-lg bg-white shadow-lg overflow-hidden ${!isVisible ? "menu-hidden" : ""}`}
      >
        {/* Beer Styles */}
        {beerStyles.map((style, index) => (
          <div key={style.value}>
            <input
              type="checkbox"
              id={`label-${style.value}`}
              name="styles[]"
              value={style.value}
              defaultChecked={filters.styles.includes(style.value)}
              onChange={handleCheckboxChange}
              className="hidden"
            />
            <label
              htmlFor={`label-${style.value}`}
              className={cn(
                "block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 border-b border-gray-200",
                index === 0 && "rounded-t-lg",
                index === beerStyles.length - 1 && "rounded-b-lg",
              )}
            >
              <span>{style.label}</span>
            </label>
          </div>
        ))}

        {/* Condition Selector */}
        <div className="flex mt-1 mb-1 bg-gray-100 rounded-lg overflow-hidden">
          <div className="flex-1">
            <input
              type="radio"
              id="label-or"
              name="condition"
              value="any"
              defaultChecked={filters.condition === "any"}
              onChange={handleCheckboxChange}
              className="hidden"
            />
            <label
              htmlFor="label-or"
              className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 text-center font-medium text-sm rounded-l-lg border-r border-gray-300"
            >
              <span>ARBA</span>
            </label>
          </div>
          <div className="flex-1">
            <input
              type="radio"
              id="label-and"
              name="condition"
              value="all"
              defaultChecked={filters.condition === "all"}
              onChange={handleCheckboxChange}
              className="hidden"
            />
            <label
              htmlFor="label-and"
              className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 text-center font-medium text-sm rounded-r-lg"
            >
              <span>IR</span>
            </label>
          </div>
        </div>

        {/* Venue Type */}
        <div>
          <input
            type="radio"
            id="label-drink"
            name="venue"
            value="drink"
            defaultChecked={filters.venue === "drink"}
            onChange={handleCheckboxChange}
            className="hidden"
          />
          <label
            htmlFor="label-drink"
            className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 border-b border-gray-200 rounded-t-lg"
          >
            <span>Gerti</span>
          </label>
        </div>

        <div>
          <input
            type="radio"
            id="label-shop"
            name="venue"
            value="shop"
            defaultChecked={filters.venue === "shop"}
            onChange={handleCheckboxChange}
            className="hidden"
          />
          <label
            htmlFor="label-shop"
            className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 rounded-b-lg"
          >
            <span>Išsinešti</span>
          </label>
        </div>
      </form>

      {/* Hide/Show Control */}
      <div
        id="menu-control"
        className={`menu-control mt-2 bg-white px-4 py-2 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow text-center text-sm font-medium text-gray-700 ${!isVisible ? "menu-control-top" : ""}`}
        onClick={() => setIsVisible((v) => !v)}
      >
        {!isVisible ? "Rodyti meniu" : "Slėpti meniu"}
      </div>
    </div>
  );
}
