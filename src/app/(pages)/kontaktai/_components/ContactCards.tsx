import { Mail, MessageSquare, Shield } from "lucide-react";
import { ContactCardItem } from "./ContactCardItem";

const CONTACT_CARDS = [
  {
    title: "Diskusijų grupė (Mailing List)",
    subtitle: "Pagrindinis bendruomenės kanalas",
    description:
      "Lietuvos OpenStreetMap žymėtojų ir bendruomenės el. pašto sąrašynas. Užduokite klausimus, diskutuokite apie žymėjimo standartus ir siūlykite idėjas.",
    linkText: "talk-lt diskusijų grupė",
    href: "https://lists.openstreetmap.org/listinfo/talk-lt",
    icon: Mail,
    color:
      "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Mastodon kanalas",
    subtitle: "Sekite naujienas trumpai",
    description:
      "Oficialus Lietuvos atvirojo žemėlapio Mastodon profilis. Čia skelbiame apie svarbiausius paslaugų atnaujinimus bei žemėlapio pasiekimus.",
    linkText: "Sekti @Atvirasis",
    href: "https://mapstodon.space/@atvirasis",
    icon: MessageSquare,
    color:
      "from-sky-500/10 to-blue-500/10 border-sky-500/20 text-sky-500 dark:text-sky-400",
  },
  {
    title: "Juridinis asmuo",
    subtitle: 'Asociacija „Atvirasis žemėlapis"',
    description:
      "Oficiali asociacija, atstovaujanti ir plėtojanti atvirojo žemėlapio bei susijusių technologijų veiklą Lietuvoje.",
    linkText: "Apie asociaciją",
    href: "http://asociacija.openmap.lt/",
    icon: Shield,
    color:
      "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  },
];

export function ContactCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {CONTACT_CARDS.map((card) => (
        <ContactCardItem key={card.title} {...card} />
      ))}
    </div>
  );
}
