import { Compass, Milestone, Navigation, Search, Sparkles } from "lucide-react";
import { NewsTimelineItem } from "./NewsTimelineItem";

const NEWS_TIMELINE = [
  {
    date: "2026-05-09",
    title: "Atnaujintas baidarių žemėlapis!",
    description:
      "Prasideda baidarių sezonas! Baidarių maršrutizavimo funkcionalumas perkeltas į naują portalą. " +
      "Jūs galite bendrinti savo sukurtus baidarių maršrutus su savo draugais, tiesiog perduodami jiems url. " +
      "Url automatiškai pasikeičia, kai jūs paskaičiuojate maršrutą, taigi tiesiog spauskite naršyklės mygtuką „Bendrinti“ ar „Share“.",
    imageUrl: "/img/cayaking_route.png",
    icon: Sparkles,
  },
  {
    date: "2026-01-25",
    title: "Pridėti žemėlapių profiliai",
    description:
      "Per ilgus openmap.lt egzistavimo metus mes sukūrėme daug skirtingų mažų web-aplikacijų, skirtų įvairiems tikslams: " +
      "bendras žemėlapis, turizmas, baidarės, craft-alus ir t.t. Naujos kartos žemėlapyje mes nusprendėme visus juos " +
      "sudėti į vieną web-aplikaciją. Todėl mums prireikė „profilių“, kurie reiškia ne tik savo skirtingą žemėlapio stilių " +
      "(ir todėl skirtingus rodomus/išryškinamus objektus), bet taipogi ir skirtingus sutartinius ženklus, filtrus bei " +
      "paieškos galimybes. Ši pirminė lego kaladėlė mums vėliau leis sukurti daug papildomo įdomaus ir naudingo funkcionalumo. " +
      "Profilius rasite visų žemėlapių apatiniame dešiniame kampe.",
    imageUrl: "/img/topo_with_profiles.png",
    icon: Sparkles,
  },
  {
    date: "2025-11-29",
    title: "Paleista nauja openmap.lt versija",
    description:
      "Paleista pirma naujos karto openmap.lt versija. Joje bus vienoje vietoje sukaupti kelių skirtingų žemėlapių aplikacijų funkcionalumai, kad naudotojams būtų paprasčiau juos rasti.",
    imageUrl: "/img/new_openmap.png",
    icon: Sparkles,
  },
  {
    date: "2017-07-20",
    title: "Lankytinų vietų kolekcionavimas",
    description:
      "Pridėtas lankytinų vietų kolekcionavimo funkcionalumas. Tai padeda lengviau rasti vietas, kurių dar nesate aplankę, ir įneša žaidimo elementą į keliones.",
    steps: [
      "Žemėlapyje nueikite į vietą, nuo kurios norite ieškoti lankytinų vietų, ir paspauskite kolekcionavimo mygtuką.",
      "Prisijunkite prie sistemos ir pasirinkite jus dominančias vietovių grupes.",
      "Sąraše matysite lankytinas vietas, išrikiuotas pagal atstumą nuo jūsų pasirinktos pozicijos.",
      "Pažymėkite vietas kaip aplankytas arba neįdomias, kad jos dingtų iš siūlomo sąrašo.",
    ],
    imageUrl: "https://places.openmap.lt/doc/kolekcionavimas.png",
    icon: Compass,
  },
  {
    date: "2017-06-09",
    title: "Lankytinų vietų paieška",
    description:
      "Integruota patogi lankytinų vietų paieška. Nuo šiol galite greitai rasti bet kurį objektą pagal pavadinimą ar raktinius žodžius tiesiai žemėlapio sąsajoje.",
    imageUrl: "https://places.openmap.lt/places_paieska.png",
    icon: Search,
  },
  {
    date: "2017-05-25",
    title: "Pozicijos nustatymas (GPS)",
    description:
      "Pridėta galimybė pritraukti žemėlapį iki jūsų esamos vietos. Mobiliuosiuose įrenginiuose nepamirškite įjungti vietovės (GPS) nustatymų.",
    imageUrl: "https://places.openmap.lt/pozicijos_nustatymas.png",
    icon: Navigation,
  },
  {
    date: "2017-04-28",
    title: "Atnaujinta mobilioji versija",
    description:
      'Startuoja pilnai atnaujinta ir mobiliesiems įrenginiams pritaikyta lankytinų vietų svetainės „places" versija.',
    icon: Sparkles,
  },
];

export function NewsTimeline() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Milestone className="size-6 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-2xl font-bold tracking-tight">
          Projekto naujienos ir istorija
        </h2>
      </div>

      <div className="relative border-l-2 border-muted pl-6 ml-4 space-y-12">
        {NEWS_TIMELINE.map((item) => (
          <NewsTimelineItem key={item.date} {...item} />
        ))}
      </div>
    </div>
  );
}
