import { ProtectedFeature } from "@/components/ProtectedFeature";
import { SearchFeature } from "@/components/SearchFeature";
import { SelectedPlaceMarker } from "@/components/SelectedPlaceMarker";

export function ProtectedProfileComponents() {
  return (
    <>
      <SearchFeature />
      <ProtectedFeature />
      <SelectedPlaceMarker />
    </>
  );
}
