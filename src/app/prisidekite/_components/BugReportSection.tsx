import { CheckCircle, Flag, HelpCircle } from "lucide-react";
import SafeImage from "@/components/SafeImage";

const STEPS = [
  {
    num: "1",
    text: "Eikite į openstreetmap.org svetainę, suraskite reikiamą vietą žemėlapyje. Maksimaliai pritraukite (zoom), kad žymeklio pozicija būtų kiek galima tikslesnė.",
    imageUrl: "https://places.openmap.lt/prideti_pastaba.png",
  },
  {
    num: "2",
    text: 'Dešiniajame meniu spustelėkite mygtuką „Pridėti pastabą prie žemėlapio" (Add a note). Žemėlapio centre atsiras žymeklis, kurį galite nutempti tiksliai ant objekto.',
    imageUrl: "https://places.openmap.lt/prideti_pastaba2.png",
  },
  {
    num: "3",
    text: "Kairiajame laukelyje parašykite kuo išsamesnį komentarą. Vietoj paprasto pavadinimo parašykite detalų tipą (pvz., 'Šio ežero pavadinimas yra Ešerinis' arba 'Čia yra kavinė Ryto Kava, veikia I-V 8-17h').",
  },
];

export function BugReportSection() {
  return (
    <div id="klaidos" className="space-y-8 scroll-mt-20">
      <div className="border-t pt-8 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Flag className="size-6 text-blue-600 dark:text-blue-400" />
          <span>Kaip pranešti apie klaidą (Notes)?</span>
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Paprasčiausias ir efektyviausias būdas patobulinti žemėlapį — pažymėti
          pastabą. Pasaulio žemėlapį prižiūrintys savanoriai pamatys jūsų
          pranešimą ir patys atliks pakeitimus. Štai kaip tai padaryti žingsnis
          po žingsnio:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow shrink-0">
                  {step.num}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Žingsnis
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.text}
              </p>
            </div>

            {step.imageUrl && (
              <div className="relative rounded-lg overflow-hidden border bg-muted shadow-inner mt-2">
                <SafeImage
                  src={step.imageUrl}
                  alt={`Žingsnis ${step.num}`}
                  className="w-full h-auto object-cover opacity-95 hover:opacity-100 transition-opacity"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 border rounded-2xl p-6">
        <div className="space-y-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="size-4.5 text-blue-600 dark:text-blue-400" />
            <span>Ar būtina registracija?</span>
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ne, pastabas galite registruoti ir neprisijungę. Tačiau, jei
            sukursite pastabą be paskyros, negausite el. pašto pranešimų, jei
            žemėlapio žymėtojai užduos patikslinančių klausimų (pvz., jei
            pritrūks informacijos įvykdyti jūsų prašymui). Jei pastabą kursite
            be registracijos, tiesiog užeikite į tą pačią žemėlapio vietą po
            dienos ar kelių ir patikrinkite, ar nėra naujų komentarų.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <CheckCircle className="size-4.5 text-emerald-600 dark:text-emerald-400" />
            <span>Kaip matyti pastabas?</span>
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Norėdami matyti kitų vartotojų ir savo pastabas oficialiame
            OpenStreetMap žemėlapyje, dešiniajame šoniniame meniu paspauskite
            „Sluoksnių pasirinkimas" (Layers) mygtuką ir uždekite varnelę ant
            „Žemėlapio pastabos" (Map Notes) sluoksnio.
          </p>
          <div className="relative rounded-lg overflow-hidden border bg-muted shadow-inner">
            <SafeImage
              src="https://places.openmap.lt/sluoksniu_pasirinkimas.png"
              alt="Sluoksnių pasirinkimas"
              className="w-full h-auto object-cover opacity-90"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
