import { Layers } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import { MAPS, type MapProfile } from "@/config";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
  const [mapStyleIndex, setMapStyleIndex] = useState(0);

  const nextMapIndex = (mapStyleIndex + 1) % activeMapProfile.mapStyles.length;

  const handleStyleChange = () => {
    setMapStyleIndex(nextMapIndex);
    mapRef?.getMap().setStyle(activeMapProfile.mapStyles[nextMapIndex].style);
  };

  const handleChangeMapProfile = (profile: MapProfile) => {
    setMapStyleIndex(0);
    onChangeMapProfile(profile);
  };

  return (
    <div className="absolute bottom-12 right-4 flex flex-row-reverse items-end gap-2">
      {activeMapProfile.mapStyles.length > 1 && (
        <Button
          variant="outline"
          className="w-28 h-24 flex flex-col items-center justify-center gap-1 p-2"
          onClick={handleStyleChange}
        >
          <div className="relative size-full">
            <Image
              src={activeMapProfile.mapStyles[nextMapIndex].image}
              alt={activeMapProfile.mapStyles[nextMapIndex].name}
              priority={false}
              fill
              unoptimized
            />
          </div>
          <span className="text-xs">
            {activeMapProfile.mapStyles[nextMapIndex].name}
          </span>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Toggle map profiles">
            <Layers />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="left" className="flex">
          {MAPS.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => handleChangeMapProfile(profile)}
              className={cn(
                "w-24 h-22 flex flex-col items-center justify-center gap-1 shrink-0",
                {
                  "border-2 border-primary": activeMapProfile.id === profile.id,
                },
              )}
            >
              <div className="relative size-full">
                <Image
                  src={profile.mapStyles[0].image}
                  alt={profile.mapStyles[0].name}
                  priority={false}
                  fill
                />
              </div>
              <span className="text-xs">{profile.mapStyles[0].name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
