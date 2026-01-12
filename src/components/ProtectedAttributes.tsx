"use client";

import type { Feature } from "geojson";

interface ProtectedAttributesProps {
  feature: Feature;
}

export function ProtectedAttributes({ feature }: ProtectedAttributesProps) {
  const { gid, pavadinimas } = feature.properties || {};

  return (
    <div
      data-testid="protected-attributes"
      className="absolute bottom-4 left-4 z-10 w-80 rounded-lg bg-white p-4 shadow-lg"
    >
      <h3 className="text-lg font-bold">Saugomos teritorijos atributai</h3>
      <div className="mt-2">
        <p>
          <strong>gid:</strong> {gid}
        </p>
        <p>
          <strong>pavadinimas:</strong> {pavadinimas}
        </p>
      </div>
    </div>
  );
}
