import { Compass, Download, Layers, Smartphone } from "lucide-react";
import { DataCardItem } from "./DataCardItem";

const DATA_CARDS = [
  {
    title: "Išmanieji telefonai (OsmAnd)",
    description:
      "Jei norite atsisiųsti šį žemėlapį su visomis lankytinomis vietomis į savo išmanųjį telefoną, naudokite programėles, palaikančias atvirus duomenis.",
    cta: "Atsisiųsti OsmAnd",
    href: "https://osmand.net/",
    icon: Smartphone,
    color:
      "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Garmin GPS įrenginiai",
    description:
      "Specialiai paruoštas Lietuvos žemėlapis Garmin navigacijos įrenginiams. Turi visas lankytinas vietas ir yra pritaikytas patogiam naudojimui.",
    cta: "Garmin žemėlapiai",
    href: "http://garmin.openmap.lt",
    icon: Compass,
    color:
      "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Pirminiai OSM duomenys",
    description:
      "Atsisiųskite žalius Lietuvos geografinius duomenis .osm formatu. Tinka pažengusiems vartotojams ir kūrėjams.",
    cta: "Atsisiųsti iš Geofabrik",
    href: "http://download.geofabrik.de/europe/lithuania.html",
    icon: Download,
    color:
      "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "GIS ESRI Shapefiles",
    description:
      "Duomenys, konvertuoti į populiarųjį GIS sistemų formatą (Shapefiles). Idealiai tinka analizei ir QGIS / ArcGIS programinei įrangai.",
    cta: "Shapefiles atsisiuntimas",
    href: "http://shapes.openmap.lt/",
    icon: Layers,
    color:
      "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
  },
];

export function DataCards() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight">
          Kaip naudoti žemėlapio duomenis?
        </h2>
        <p className="text-sm text-muted-foreground">
          Atraskite būdus integruoti mūsų duomenis į savo navigacinius
          įrenginius arba analizuoti juos GIS įrankiais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DATA_CARDS.map((card) => (
          <DataCardItem key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
