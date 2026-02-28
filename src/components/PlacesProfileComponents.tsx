import { PlacesFeature } from "@/components/PlacesFeature";
import { SearchFeature } from "@/components/SearchFeature";
import { SelectedPlaceMarker } from "@/components/SelectedPlaceMarker";

type PlacesProfileComponentsProps = {
  initialFilterType?: string;
};

export function PlacesProfileComponents({
  initialFilterType,
}: PlacesProfileComponentsProps) {
  return (
    <>
      <SearchFeature />
      <PlacesFeature initialFilterType={initialFilterType} />
      <SelectedPlaceMarker />
    </>
  );
}
