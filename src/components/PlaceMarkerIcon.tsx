import type * as React from "react";

interface PlaceMarkerIconProps {
  icon: React.ElementType;
  color: string;
  size?: number;
}

export function PlaceMarkerIcon({
  icon: Icon,
  color,
  size = 32,
}: PlaceMarkerIconProps) {
  const radius = (size / 2) * (14 / 16); // Scale radius based on 14/16 ratio from original 32px size
  const center = size / 2;
  const iconSize = size / 2;
  const iconOffset = (size - iconSize) / 2;

  return (
    <svg
      role="img"
      aria-label="Map marker"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx={center}
        cy={center + 1}
        r={radius}
        fill="black"
        fillOpacity="0.2"
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill={color}
        stroke="white"
        strokeWidth="2"
      />
      <g transform={`translate(${iconOffset}, ${iconOffset})`}>
        <Icon size={iconSize} color="white" strokeWidth={2} />
      </g>
    </svg>
  );
}
