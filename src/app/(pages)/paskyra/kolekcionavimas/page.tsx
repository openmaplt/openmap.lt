import type { Metadata } from "next";
import { CollectionSelector } from "@/components/dashboard/CollectionSelector";
import { requireUser } from "@/lib/auth";
import { getUserCollectionTypeCodes } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Kolekcionavimas - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await requireUser("/paskyra/kolekcionavimas");
  const initialTypeCodes = await getUserCollectionTypeCodes(user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Kolekcionavimas
      </h1>
      <p className="text-sm text-muted-foreground">
        Pažymėkite, kokius objektų tipus norite kolekcionuoti, ir paspauskite
        „Išsaugoti“.
      </p>
      <CollectionSelector initialTypeCodes={initialTypeCodes} />
    </div>
  );
}
