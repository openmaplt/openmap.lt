import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import {
  convertToModelMessages,
  createProviderRegistry,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  Output,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import type { Feature } from "geojson";
import { AI_MODEL_ID } from "@/config/aiModel";
import { DEFAULT_ICON, PLACE_ICONS } from "@/config/places-icons";
import {
  buildPlaceTypeCatalogPrompt,
  buildTagFilterCatalogPrompt,
} from "@/lib/aiSearchCatalog";
import { type AiSearchPlan, AiSearchPlanSchema } from "@/lib/aiSearchSchema";

// The bare `google`/`mistral` defaults (createGoogleGenerativeAI(),
// createMistral()) read their own provider-specific env vars
// (GOOGLE_GENERATIVE_AI_API_KEY / MISTRAL_API_KEY) — pass apiKey explicitly
// from the one generic AI_MODEL_API_KEY instead, or this breaks silently in
// production. Only the provider selected by AI_MODEL_ID (src/config/
// aiModel.ts) is ever actually called, so both entries sharing the same key
// is fine — the unused one is just never exercised.
const registry = createProviderRegistry({
  google: createGoogleGenerativeAI({ apiKey: process.env.AI_MODEL_API_KEY }),
  mistral: createMistral({ apiKey: process.env.AI_MODEL_API_KEY }),
});

function getModel() {
  return registry.languageModel(AI_MODEL_ID);
}

// Longer history degrades this model's structured-output reliability (3
// messages succeeded consistently in testing, 5 failed roughly 2/3 of the
// time) — only classifySearchQuery is capped; streamSearchResponse below
// gets the full conversation.
const FIRST_CALL_HISTORY_LIMIT = 3;

function buildFirstCallSystemPrompt(): string {
  // Numbered, strict rules + schema max(3) on "types" — without both, this
  // model sometimes returned dozens of codes instead of the 1-3 relevant
  // ones, failing validation.
  return `Tu esi openmap.lt (Lietuvos žemėlapio) paieškos asistentas. Vartotojas rašo laisvą lietuvišką užklausą apie vietas žemėlapyje. Tavo užduotis — paversti ją į struktūrizuotą filtrą, NIEKADA į SQL.

Kiekviena grupė gali turėti:
- "types": masyvą kodų IŠ ŠIO KATALOGO:
${buildPlaceTypeCatalogPrompt()}
- "tagFilterIds": masyvą id IŠ ŠIO SĄRAŠO (tikslūs faktai, kai jie tinka, pvz. ["shop=bakery"]):
${buildTagFilterCatalogPrompt()}
- "keywords": 2-6 lietuviškus sinonimus/susijusius žodžius (NE pažodinį vartotojo pasikartojimą), kai nėra tikslaus tipo/tag atitikmens (pvz. virtuvės rūšis, konkretus patiekalas). IŠIMTIS: jei vartotojas paminėjo KONKRETŲ VIETOS/OBJEKTO PAVADINIMĄ (pvz. darželis "Žingsnelis", baras "Špunka"), VISADA įtrauk TIKSLŲ tą pavadinimą (ne sinonimą, ne bendrą kategoriją) kaip keyword — net jei tinka konkretus "types" kodas tai kategorijai. Šiuo atveju "types" (jei toks yra) IR pavadinimo keyword naudojami KARTU toje pačioje grupėje — pavadinimas susiaurina iki BŪTENT to vieno objekto, ne visos kategorijos.

TAISYKLĖS DĖL "types" (SVARBU, LAIKYKIS TIKSLIAI):
1. Rašyk NE DAUGIAU KAIP 1-3 KODUS.
2. Rašyk TIK kodus, kurie TIKSLIAI ir AKIVAIZDŽIAI atitinka užklausą.
3. NIEKADA nerašyk daugiau nei 3 kodų — jei neaišku, rink 1 labiausiai tikėtiną arba palik [].
4. Ignoruok visus katalogo kodus, kurie NEsusiję su užklausa.

TAISYKLĖS DĖL GRUPIŲ IR "tagFilterIds" (SVARBU, LAIKYKIS TIKSLIAI):
5. Jei "types" IR "tagFilterIds" abu tinka TAI PAČIAI vartotojo minčiai (pvz. "craftinio alaus baras" = tipas "r" + tag "real_ale=*"), abu įrašyk Į TĄ PAČIĄ grupę (tas pats grupės objektas, abu laukai užpildyti kartu). NIEKADA nekurk atskiros grupės vien su "types" IR dar vienos atskiros grupės vien su "tagFilterIds" tai pačiai minčiai — grupės jungiamos "ARBA", tad atskira "types" grupė be tag filtro grąžins VISUS to tipo objektus ir taip prarasi susiaurinimą.
6. Kelias ATSKIRAS grupes kurk TIK kai vartotojas nori kelių NESUSIJUSIŲ dalykų (pvz. "itališko maisto IR craft alaus" — viena grupė itališkam maistui per keywords, kita grupė craft alui su types+tagFilterIds kartu, kaip 5 taisyklėje).
7. Jei "tagFilterIds" sąrašo aprašyme parašyta "PRIVALOMA" ir užklausoje yra tą aprašymą atitinkantis žodis, VISADA įtrauk tą tagFilterId — net jei atitinkamas "types" kodas atrodo pakankamas be jo. Vien "types" BE "tagFilterIds" tokiu atveju yra KLAIDINGAS atsakymas.
8. "keywords" IR "types"/"tagFilterIds" TOJE PAČIOJE grupėje jungiami DUOMENŲ BAZĖJE PER "IR" (ne "arba") — jei "types"/"tagFilterIds" jau TIKSLIAI atitinka vartotojo mintį (kaip 5 taisyklėje), NIEKADA nepridėk PRIE JŲ dar bendrinių sinonimų kaip "keywords": tie žodžiai ("craftinis", "amatininkų", "tikras" ir pan.) NIEKADA pažodžiui nepasirodys vietos pavadinime/aprašyme duomenų bazėje, tad DB PAIEŠKA GRĄŽINS NULĮ REZULTATŲ, nors tinkamų vietų yra. "keywords" pildyk KARTU su "types"/"tagFilterIds" TIK KONKRETAUS PAVADINIMO IŠIMČIai (žr. aukščiau, pvz. "Špunka") — niekada bendriniam sinonimui.

PAVYZDYS: užklausa "kur galiu paragauti craftinio alaus?" →
TEISINGAI: {"groups": [{"types": ["r"], "tagFilterIds": ["real_ale=*"], "keywords": []}]} — VIENA grupė, abu laukai kartu, "keywords" TUŠČIAS.
NETEISINGAI: {"groups": [{"types": ["r"], ...}, {"tagFilterIds": ["real_ale=*"], ...}]} — dvi atskiros grupės tai pačiai minčiai grąžintų VISUS barus, ne tik craftinius.
NETEISINGAI: {"groups": [{"types": ["r"], "tagFilterIds": ["real_ale=*"], "keywords": ["craftinis alus", "amatininkų alus"]}]} — "keywords" čia PERTEKLINIS ir KLAIDINGAS (8 taisyklė): susiaurina paiešką iki pavadinimų, turinčių tuos žodžius pažodžiui, ir grąžina 0 rezultatų, nors "types"+"tagFilterIds" jau tiksliai atitinka.

Jei vartotojas klausia apie BENDRĄ KATEGORIJĄ (ne konkretų pavadinimą), naudok tipą/tag PIRMENYBĖS TVARKA prieš keywords — jis tikslesnis. Jei vartotojas paminėjo KONKRETŲ PAVADINIMĄ, žr. IŠIMTĮ prie "keywords" aukščiau. Visada grąžink bent vieną grupę.`;
}

export type AiSearchPoiSummary = {
  id: string;
  name: string;
  category: string;
  distKm: string | null;
  description: string | null;
};

// `category` matters when groups mix concepts (e.g. "sightseeing spots" +
// "craft beer bars" as two OR'd groups) — the combined DB result has no
// per-row record of which group matched, so without a real category label
// here, the second call would have to guess from the name alone whether a
// given result ("Spunka") is a bar or a historic site. Reusing PLACE_ICONS
// (same TYPE → label mapping used for map markers) instead of inventing a
// second lookup.
export function toPoiSummaries(features: Feature[]): AiSearchPoiSummary[] {
  return features.map((f) => ({
    id: String(f.id),
    name: (f.properties?.name as string | undefined) ?? "Be pavadinimo",
    category:
      PLACE_ICONS[f.properties?.TYPE as string]?.name ?? DEFAULT_ICON.name,
    distKm:
      typeof f.properties?.DIST === "number"
        ? (f.properties.DIST / 1000).toFixed(2)
        : null,
    description: (f.properties?.description as string | undefined) ?? null,
  }));
}

function buildSecondCallSystemPrompt(poiList: AiSearchPoiSummary[]): string {
  if (poiList.length === 0) {
    // State explicitly that the location IS known (search ran from the
    // current map center) — otherwise the model sometimes invents a wrong
    // excuse ("I can't see where you are") instead of "no matches at all".
    // Also explicitly forbid suggesting to pan/zoom the map: places.ai_search
    // (sql/ai_search.sql) is NOT bbox-limited — it ranks by distance from
    // pos but returns the nearest matches regardless of how far they are,
    // so a zero-result plan means no row anywhere in the DB satisfies the
    // criteria; moving/zooming the map cannot change that outcome, and
    // suggesting it used to be true before bbox filtering was removed from
    // the SQL — telling the user to do it now is a misleading dead end.
    return `Tu esi openmap.lt paieškos asistentas. Paieška TIKRAI ĮVYKO — ji apima VISĄ šalį, ne tik dabartinį žemėlapio matomą langą, ir grąžina artimiausius atitikmenis nuo vartotojo vietos NEPRIKLAUSOMAI nuo atstumo — bet šįkart DUOMENŲ BAZĖJE nerasta NĖ VIENO tinkamo objekto pagal šiuos kriterijus. NIEKADA nesakyk, kad "nematai" ar "nežinai", kurioje vietoje vartotojas yra. NIEKADA nesiūlyk paslinkti, pritraukti ar atitraukti žemėlapį — paieška NEPRIKLAUSO nuo matomo lango ar mastelio, tad tai NIEKADA nepadėtų rasti daugiau rezultatų. Tai gali būti tolesnė žinutė pokalbyje, NE pirma — NIEKADA nepradėk atsakymo sveikinimu ("Sveiki", "Labas" ir pan.), atsakyk tiesiai į temą. Atsakyk lietuviškai, trumpai, draugiškai — pasakyk, kad tokių vietų duomenų bazėje nerasta, ir pasiūlyk pabandyti kitokią užklausą ar raktažodį.`;
  }

  const listText = poiList
    .map(
      (p) =>
        `- id=${p.id}, pavadinimas="${p.name}", kategorija="${p.category}"${p.distKm ? `, atstumas=${p.distKm} km` : ""}${p.description ? `, aprašymas="${p.description}"` : ""}`,
    )
    .join("\n");

  return `Tu esi openmap.lt paieškos asistentas. Žemiau yra TIKRAS radinių sąrašas iš duombazės (id, pavadinimas, kategorija, atstumas, kai kur ir aprašymas) — tai VIENINTELIAI objektai, kuriuos gali minėti. Tai gali būti tolesnė žinutė pokalbyje, NE pirma — NIEKADA nepradėk atsakymo sveikinimu ("Sveiki", "Labas" ir pan.), atsakyk tiesiai į temą. Parašyk trumpą, draugišką lietuvišką atsakymą vartotojui, paminėdamas 3-8 tinkamiausius radinius. Kiekvieną paminėtą vietą PRIVALAI pateikti kaip markdown nuorodą tiksliai šia forma: [Pavadinimas](poi:<id>), naudojant TIK žemiau esančius id — NIEKADA nesugalvok naujo id ar vietos, kurios nėra sąraše.

SVARBIAUSIA TAISYKLĖ: jei radiniai žemiau AKIVAIZDŽIAI NEATITINKA to, ko vartotojas klausė pokalbyje (pvz. vartotojas klausė apie Palangą, o sąraše — Kauno objektai), NIEKADA nesuk pavadinimų iš savo bendrų žinių, kad "atsakytum tinkamai" — TAI DRAUDŽIAMA, net jei labai norisi padėti. Tokiu atveju sąžiningai pasakyk, kad TOJE VIETOJE (ar pagal tuos kriterijus) tinkamų radinių nerasta, ir NEMINĖK NĖ VIENOS poi: nuorodos. Kiekvienas paminėtas pavadinimas IR jo id PRIVALO būti TA PATI eilutė iš sąrašo žemiau — niekada nesuporuok teisingo id su neteisingu (iš atminties sugalvotu) pavadinimu, ir niekada atvirkščiai.

SVARBU: apie kiekvieną vietą žinai TIK tai, kas nurodyta žemiau (pavadinimas, kategorija, atstumas, aprašymas, jei duotas). Jei vartotojo užklausa turėjo kelis skirtingus norus (pvz. lankytinos vietos IR barai), radiniai žemiau gali būti IŠ ABIEJŲ kategorijų sumaišyti kartu — naudok "kategorija" lauką, kad teisingai atskirtum, kuris radinys kuriai užklausos daliai tinka (pvz. sugrupuok atsakymą į "Lankytinos vietos:" / "Barai:" pagal REALIĄ kategoriją, NE spėdamas iš pavadinimo). NIEKADA nerašyk papildomų "faktų" (istorija, statybos data, architektūra, darbo laikas ir pan.) IŠ SAVO BENDRŲ ŽINIŲ/ATMINTIES, net jei tai žinai — tokie faktai mūsų duombazėje nepatvirtinti, tad gali būti netikslūs ar pasenę. Jei objektas neturi aprašymo ir norisi jį pakomentuoti, naudok TIK bendrus, neutralius žodžius (pvz. "puiki vieta pasivaikščioti"), niekada konkrečių faktinių teiginių iš atminties.

Radiniai:
${listText}`;
}

// A real LLM API call — expected to fail sometimes (billing, rate limits,
// network); callers should catch this. Takes the raw UIMessage[] from the
// client request — the ModelMessage conversion is this module's concern,
// not the route's.
export async function classifySearchQuery(
  messages: UIMessage[],
): Promise<AiSearchPlan> {
  const modelMessages = await convertToModelMessages(messages);
  const { output } = await generateText({
    model: getModel(),
    // generateText+Output.object(), not generateObject (deprecated in ai@7).
    output: Output.object({ schema: AiSearchPlanSchema }),
    instructions: buildFirstCallSystemPrompt(),
    messages: modelMessages.slice(-FIRST_CALL_HISTORY_LIMIT),
    temperature: 0,
  });
  return output;
}

// Returns a ready-to-return Response so the route handler doesn't need to
// know anything about the AI SDK's streaming shapes.
export async function streamSearchResponse(
  messages: UIMessage[],
  poiList: AiSearchPoiSummary[],
): Promise<Response> {
  const modelMessages = await convertToModelMessages(messages);
  const result = streamText({
    model: getModel(),
    instructions: buildSecondCallSystemPrompt(poiList),
    messages: modelMessages,
    onError: ({ error }) => {
      // Fires mid-stream (Response already sent) — nothing to return as an
      // HTTP status; the client sees this via useChat()'s status === "error".
      console.error("AI search — streamText error:", error);
    },
  });

  // A transient data part carries the matched POI ids to the client
  // (AiSearchChat.tsx's onData) so the map can highlight them all — this is
  // the full match set, unlike the [label](poi:<id>) markdown links, which
  // only cover the 3-8 POIs the model chose to mention in its reply.
  // "transient" keeps it out of persisted message history.
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({
        type: "data-aiSearchResultIds",
        data: poiList.map((p) => p.id),
        transient: true,
      });
      // toUIMessageStreamResponse() on the result is deprecated in ai@7 in
      // favor of these standalone helpers.
      writer.merge(toUIMessageStream({ stream: result.stream }));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
