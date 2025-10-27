
import { memo, useState } from "react";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isProfilesVisible, setProfilesVisible] = useState(false);

  const isOrtho = activeMapStyle.name === activeMapProfile.orthoStyle.name;

  return (
    <div
      className={cn(
        "absolute bottom-12 right-4 flex flex-row-reverse items-end gap-2",
        className,
      )}
    >
      <Button
        variant="map"
        className="h-20 w-20"
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

      <Button
        variant="map"
        className="h-10 w-10"
        onClick={() => setProfilesVisible(!isProfilesVisible)}
        aria-label="Toggle map profiles"
      >
        <Layers />
      </Button>

      {isProfilesVisible &&
        mapProfiles.map((profile) => (
          <Button
            key={profile.name}
            variant="map"
            className={cn({
              "border-white": profile.name === activeMapProfile.name,
            })}
            onClick={() => onChangeMapProfile(profile)}
          >
            <img
              src={profile.mapStyle.image}
              alt={profile.mapStyle.name}
              className="h-full w-full object-cover"
            />
          </Button>
        ))}
    </div>
  );
}

export default memo(MapStyle);
