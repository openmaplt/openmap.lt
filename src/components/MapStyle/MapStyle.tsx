
import { memo } from "react";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "../ui/button";

export type MapStyle = {
  name: string;
  style: string;
  image: string;
};

export type MapProfile = {
  name: string;
  mapStyle: MapStyle;
  orthoStyle: MapStyle;
};

type Props = {
  mapProfiles: MapProfile[];
  activeMapProfile: MapProfile;
  activeMapStyle: MapStyle;
  onChangeMapProfile: (profile: MapProfile) => void;
  onChangeMapStyle: (style: MapStyle) => void;
  className?: string;
};

function MapStyle({
  mapProfiles,
  activeMapProfile,
  activeMapStyle,
  onChangeMapProfile,
  onChangeMapStyle,
  className,
}: Props) {
  const isOrtho = activeMapStyle.name === activeMapProfile.orthoStyle.name;

  return (
    <div
      className={cn(
        "absolute bottom-12 right-4 flex flex-row-reverse gap-2",
        className,
      )}
    >
      <Button
        variant="map"
        onClick={() =>
          onChangeMapStyle(
            isOrtho ? activeMapProfile.mapStyle : activeMapProfile.orthoStyle,
          )
        }
      >
        <img
          src={
            isOrtho
              ? activeMapProfile.mapStyle.image
              : activeMapProfile.orthoStyle.image
          }
          alt={
            isOrtho
              ? activeMapProfile.mapStyle.name
              : activeMapProfile.orthoStyle.name
          }
          className="h-full w-full object-cover"
        />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="map">
            <img
              src={activeMapProfile.mapStyle.image}
              alt={activeMapProfile.mapStyle.name}
              className="h-full w-full object-cover"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          className="flex flex-row-reverse gap-2 bg-transparent"
        >
          {mapProfiles.map(
            (profile) =>
              profile.name !== activeMapProfile.name && (
                <DropdownMenuItem
                  key={profile.name}
                  className="bg-transparent p-0"
                  onClick={() => onChangeMapProfile(profile)}
                >
                  <Button variant="map">
                    <img
                      src={profile.mapStyle.image}
                      alt={profile.mapStyle.name}
                      className="h-full w-full object-cover"
                    />
                  </Button>
                </DropdownMenuItem>
              ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default memo(MapStyle);
