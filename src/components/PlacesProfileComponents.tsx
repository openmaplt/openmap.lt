import { PlacesFeature } from "@/components/PlacesFeature";
import { SearchFeature } from "@/components/SearchFeature";

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
    </>
  );
}
