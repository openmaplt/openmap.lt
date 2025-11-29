import { ChevronUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import { MAPS, type MapProfile } from "@/config/map";
import { cn } from "@/lib/utils";

type MapStyleSwitcherProps = {
  activeMapProfile: MapProfile;
  onChangeMapProfile: (profile: MapProfile) => void;
  className?: string;
};

export function MapStyleSwitcher({
  activeMapProfile,
  onChangeMapProfile,
}: MapStyleSwitcherProps) {
  const { current: mapRef } = useMap();
  const [isOpen, setIsOpen] = useState(false);
  const [mapStyleIndex, setMapStyleIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextMapIndex = (mapStyleIndex + 1) % activeMapProfile.mapStyles.length;

  const handleStyleChange = () => {
    setMapStyleIndex(nextMapIndex);
    mapRef?.getMap().setStyle(activeMapProfile.mapStyles[nextMapIndex].style);
  };

  const handleChangeMapProfile = (profile: MapProfile) => {
    setMapStyleIndex(0);
    setIsOpen(false);
    onChangeMapProfile(profile);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-3 right-3 flex flex-col items-center bg-white p-2 rounded-lg shadow-xl"
    >
      {/* Expanded List */}
      <div
        className={cn(
          "flex flex-col gap-2 p-1 overflow-y-auto",
          isOpen
            ? "opacity-100 scale-100 translate-x-0 max-h-[calc(100vh-200px)]"
            : "opacity-0 scale-95 translate-x-4 absolute bottom-full right-0 w-0",
        )}
      >
        {MAPS.map((profile) => (
          <Button
            key={profile.id}
            onClick={() => handleChangeMapProfile(profile)}
            asChild
          >
            <div
              className={cn(
                "w-20 h-20 flex flex-col items-center justify-center shrink-0 gap-1 relative group rounded-lg overflow-hidden",
                activeMapProfile.id === profile.id && "ring-2 ring-primary",
              )}
            >
              <Image
                src={profile.mapStyles[0].image}
                alt={profile.mapStyles[0].name}
                priority={false}
                fill
                className="object-cover"
              />
              <span className="absolute bottom-0 w-full text-center bg-white/80 text-xs font-medium text-black py-0.5 backdrop-blur-sm">
                {profile.mapStyles[0].name}
              </span>
            </div>
          </Button>
        ))}
      </div>

      {/* Main Controls */}
      <div className="flex flex-col items-center gap-1 p-1">
        {/* Expand Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-fit rounded-lg hover:bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronUp
            className={cn(
              "size-5 transition-transform duration-300",
              isOpen ? "rotate-180" : "rotate-0",
            )}
          />
        </Button>

        {/* Toggle Style Button */}
        {activeMapProfile.mapStyles.length > 1 && (
          <Button onClick={handleStyleChange} asChild>
            <div className="w-20 h-20 flex flex-col items-center justify-center shrink-0 gap-1 relative group rounded-lg overflow-hidden">
              <Image
                src={activeMapProfile.mapStyles[nextMapIndex].image}
                alt={activeMapProfile.mapStyles[nextMapIndex].name}
                priority={false}
                fill
                className="object-cover"
                unoptimized
              />
              <span className="absolute bottom-0 w-full text-center bg-white/80 text-xs font-medium text-black py-0.5 backdrop-blur-sm">
                {activeMapProfile.mapStyles[nextMapIndex].name}
              </span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
