import { ProtectedFeature } from "@/components/ProtectedFeature";
import { SearchFeature } from "@/components/SearchFeature";

export function ProtectedProfileComponents() {
  return (
    <>
      <SearchFeature />
      <ProtectedFeature />
    </>
  );
}
