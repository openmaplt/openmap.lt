import { DEFAULT_ICON, PLACE_ICONS } from "@/config/places-icons";

interface PlaceIconProps {
  icon: string;
  size?: "sm" | "md";
  className?: string;
}

export function PlaceIcon({ icon, size = "md", className }: PlaceIconProps) {
  const { icon: Icon, color } = PLACE_ICONS[icon] ?? DEFAULT_ICON;
  const containerSize =
    size === "sm" ? "size-8 rounded-lg" : "size-10 rounded-xl";
  const iconSize = size === "sm" ? "size-4" : "size-5";

  return (
    <div
      className={`${containerSize} bg-muted border flex items-center justify-center shadow-inner ${className ?? ""}`}
    >
      <Icon style={{ color }} className={iconSize} />
    </div>
  );
}
