import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";
import { BASE_URL } from "@/config/config";
import { ContactCards } from "./_components/ContactCards";

export const metadata: Metadata = {
  title: "Kontaktai - Openmap.lt",
  description:
    "Susisiekite su Openmap.lt kūrėjais. Lietuvos OpenStreetMap bendruomenės kontaktai, asociacija Atvirasis žemėlapis.",
  alternates: { canonical: `${BASE_URL}/kontaktai` },
};

export default function Page() {
  return (
    <HelpLayout>
      <div className="space-y-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight">Kontaktai</h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Jeigu turite klausimų apie žemėlapio veikimą, radote klaidą, norite
            pasiūlyti naujų funkcijų arba norite bendradarbiauti, susisiekite su
            mumis ir Lietuvos OpenStreetMap bendruomene žemiau nurodytais
            kanalais.
          </p>
        </div>
        <ContactCards />
      </div>
    </HelpLayout>
  );
}
