import { ArrowUpRight, PenTool } from "lucide-react";

export function EditSection() {
  return (
    <div id="redagavimas" className="space-y-6 border-t pt-8 scroll-mt-20">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <PenTool className="size-6 text-emerald-600 dark:text-emerald-400" />
        <span>Žemėlapio redagavimas pačiam</span>
      </h2>
      <div className="bg-card border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-sm">
        <div className="space-y-3">
          <h3 className="text-lg font-bold">
            Prisijunkite prie atvirojo žemėlapio žymėtojų!
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Jeigu norite patys tiesiogiai redaguoti kelius, pastatus ar
            lankytinas vietas, galite tapti tikru OpenStreetMap bendruomenės
            nariu. Tai itin įdomi veikla, padedanti tūkstančiams Lietuvos
            keliautojų ir paslaugų naudotojų gauti tiksliausią geografinę
            informaciją.
          </p>
          <p className="text-sm text-muted-foreground">
            Visą reikalingą informaciją bei lietuviškas pamokas, kaip pradėti
            redaguoti atvirąjį žemėlapį, rasite oficialiame tinklaraštyje.
          </p>
        </div>

        <a
          href="http://blog.openmap.lt"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-600/90 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 shrink-0 text-sm"
        >
          <span>Aplankyti blog.openmap.lt</span>
          <ArrowUpRight className="size-4" />
        </a>
      </div>
    </div>
  );
}
