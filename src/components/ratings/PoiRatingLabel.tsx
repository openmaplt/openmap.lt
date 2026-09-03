"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface PoiRatingLabelProps {
  canRate: boolean;
  myRating: number | null;
  averageRating: number | null;
}

// The average always leads when it exists, so the layout never jumps around
// as you log in or rate something — only the part after it changes depending
// on whether you can rate, and whether you already have.
export function PoiRatingLabel({
  canRate,
  myRating,
  averageRating,
}: PoiRatingLabelProps) {
  const pathname = usePathname();

  const averagePrefix =
    averageRating != null ? `${averageRating.toFixed(1)} · ` : "";
  const loginLink = (
    <Link
      href={`/prisijungimas?returnTo=${encodeURIComponent(pathname)}`}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      Prisijunkite
    </Link>
  );

  if (canRate && myRating != null) {
    return (
      <>
        {averagePrefix}Jūs: {myRating}
      </>
    );
  }

  if (canRate && averageRating != null) {
    return <>{averagePrefix}Neįvertinote</>;
  }

  if (canRate) {
    return <>Įvertinkite</>;
  }

  if (averageRating != null) {
    return (
      <>
        {averagePrefix}
        {loginLink}, kad įvertintumėte
      </>
    );
  }

  return <>{loginLink} ir įvertinkite</>;
}
