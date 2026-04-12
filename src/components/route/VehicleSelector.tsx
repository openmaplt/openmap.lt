"use client";

import { Bike, Car, Footprints, Navigation, Sailboat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMapActions, useMapConfig } from "@/providers/MapProvider";

interface VehicleSelectorProps {
  className?: string;
}

export function VehicleSelector({ className }: VehicleSelectorProps) {
  const { activeMapProfile, selectedRouteProfile } = useMapConfig();
  const { setSelectedRouteProfile } = useMapActions();

  if (
    !activeMapProfile.routingProfiles ||
    activeMapProfile.routingProfiles.length <= 1
  ) {
    return null;
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {activeMapProfile.routingProfiles.map((profile) => {
        const isSelected = selectedRouteProfile === profile;
        const Icon =
          profile === "car"
            ? Car
            : profile === "bike"
              ? Bike
              : profile === "foot"
                ? Footprints
                : profile === "kayak"
                  ? Sailboat
                  : Navigation;

        return (
          <Button
            key={profile}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-1 gap-2 h-9",
              isSelected
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "text-gray-600 border-gray-200",
            )}
            onClick={() => setSelectedRouteProfile(profile)}
          >
            <Icon className="w-4 h-4" />
            <span className="capitalize text-xs">
              {profile === "car"
                ? "Auto"
                : profile === "bike"
                  ? "Dviratis"
                  : profile === "foot"
                    ? "Pėsčiomis"
                    : profile === "kayak"
                      ? "Baidarė"
                      : profile}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
