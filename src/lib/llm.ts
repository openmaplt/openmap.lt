/**
 * LLM Integration for Natural Language Search
 * Naudoja Ollama su TildeOpen modeliu natūralios kalbos užklausų interpretavimui
 */

export interface SearchQuery {
  poiType?: string; // POI tipas (pvz., "bar", "hospital", "car_wash")
  landmark?: string; // Orientyras (pvz., "Baltas angelas", "Žirmūnų tiltas")
  city?: string; // Miestas (pvz., "Vilnius", "Kaunas")
  keywords?: string[]; // Papildomi raktažodžiai
  radius?: number; // Paieškos spindulys metrais (default: 5000)
}

interface LLMResponse {
  poiType?: string;
  landmark?: string;
  city?: string;
  keywords?: string[];
  radius?: number;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:latest";

/**
 * Sisteminė žinutė, kuri nurodo LLM kaip interpretuoti lietuviškus paieškos tekstus
 */
const SYSTEM_PROMPT = `Tu esi paieškos užklausų interpretatorius Lietuvos žemėlapiui. 
Tavo užduotis - interpretuoti natūralios lietuvių kalbos užklausas ir išgauti struktūrizuotus duomenis.

Atpažink šiuos POI tipus (naudok angliškas vertes):
- baras, pub'as, restoranas → "bar" arba "restaurant"  
- ligoninė, klinika, poliklinika → "hospital"
- plovykla, automobilių plovykla → "car_wash"
- kemping'as, stovyklavietė → "camp_site"
- paštas, pašto skyrius → "post_office"
- parkas → "park"
- tiltas → "bridge"
- bažnyčia → "place_of_worship"
- mokykla → "school"
- parduotuvė, prekybos centras → "shop" arba "supermarket"
- vaistinė → "pharmacy"
- bankas → "bank"
- degalinė → "fuel"
- viešbutis → "hotel"
- muziejus → "museum"

Atpažink Lietuvos miestus: Vilnius, Kaunas, Klaipėda, Šiauliai, Panevėžys, Alytus, Marijampolė, Mažeikiai, Jonava, Utena, Kėdainiai, Telšiai, Tauragė, Ukmergė, Visaginas, Plungė, Kretinga, Šilutė, Palanga, Radviliškis, Druskininkai, Rokiškis, Biržai, Elektrėnai, Garliava, Kuršėnai, Jurbarkas, Vilkaviškis, Raseiniai, Anykščiai, Lentvaris, Grigiškės, Prienai, Joniškis, Gargždai, Varėna, Trakai, ir kt.

Atpažink žinomus orientyrus (pvz., "Baltas angelas", "Žirmūnų tiltas", "Vingio parkas", "Mega", "Akropolis", "Gedimino pilies bokštas").

Grąžink JSON formatą:
{
  "poiType": "POI tipas arba null",
  "landmark": "Orientyras arba null", 
  "city": "Miestas arba null",
  "keywords": ["papildomi", "raktažodžiai"] arba [],
  "radius": paieškos spindulys metrais (default: 5000)
}

Atsakyk TIKTAI JSON formatu, be jokių papildomų paaiškinimų.`;

/**
 * Interpretuoja natūralios kalbos užklausą naudojant LLM
 */
export async function interpretQuery(query: string): Promise<SearchQuery> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${SYSTEM_PROMPT}\n\nVartotojo užklausa: "${query}"\n\nAtsakymas (JSON):`,
        stream: false,
        format: "json",
        options: {
          temperature: 0.3,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API klaida: ${response.status}`);
    }

    const data = await response.json();
    const llmResponse = JSON.parse(data.response) as LLMResponse;

    // Normalizuojame ir grąžiname rezultatą
    return {
      poiType: llmResponse.poiType || undefined,
      landmark: llmResponse.landmark || undefined,
      city: llmResponse.city || undefined,
      keywords: llmResponse.keywords || [],
      radius: llmResponse.radius || 5000,
    };
  } catch (error) {
    console.error("LLM interpretavimo klaida:", error);
    // Grąžiname paprastą keyword paiešką jei LLM nepavyko
    return {
      keywords: query.split(" ").filter((w) => w.length > 2),
      radius: 5000,
    };
  }
}

/**
 * Patikrina ar Ollama servisas yra pasiekiamas
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}
