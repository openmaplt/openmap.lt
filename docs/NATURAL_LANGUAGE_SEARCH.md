# Natūralios Kalbos Paieška / Natural Language Search

## Apžvalga

Openmap.lt projektas palaiko natūralios lietuvių kalbos paiešką naudodamas TildeOpen-30b LLM modelį, kuris veikia Docker konteineryje per vLLM platformą.

## Architektūra

### Komponentai

1. **Frontend (SearchBar.tsx)**
   - React komponentas su paieškos lauku
   - Rodo paieškos rezultatus dropdown sąraše
   - Leidžia pasirinkti rezultatą ir nukelia žemėlapį

2. **API Endpoint (/api/search)**
   - Priima GET arba POST užklausas
   - Perduoda užklausą LLM interpretacijai
   - Grąžina JSON su rezultatais

3. **LLM Integration (lib/llm.ts)**
   - Bendrauja su vLLM API (OpenAI-compatible)
   - Naudoja system prompt'ą lietuvių kalbos interpretavimui
   - Grąžina struktūrizuotus duomenis (JSON)

4. **Database Search (lib/searchDb.ts)**
   - Konstruoja PostgreSQL užklausas pagal LLM interpretaciją
   - Naudoja PostGIS funkcijas atstumų skaičiavimui
   - Grąžina POI sąrašą su koordinatėmis

5. **vLLM Docker Service**
   - Lokalus LLM serveris su TildeOpen-30b modeliu
   - OpenAI-compatible API
   - API per port 8000
   - Reikalauja GPU (~60GB VRAM)

### Duomenų srautas

```
Vartotojas → SearchBar → /api/search → LLM (vLLM/TildeOpen-30b) → searchPOI() → PostgreSQL → Rezultatai → Žemėlapis
```

## LLM Modelis

### TildeOpen-30b

- **TildeAI/TildeOpen-30b** (vienintelis palaikomas modelis)
  - Sukurtas Tilde AI lietuvių kalbai
  - 30 milijardų parametrų
  - Optimizuotas lietuvių kalbai ir Baltijos šalių kontekstui
  - Geriausias lietuviškų užklausų supratimas
  - Atpažįsta Lietuvos geografiją ir orientyrus

- **llama3.2:latest** (alternatyva)
  - Meta Llama 3.2 modelis
  - Geras daugiakalbis palaikymas
  - Labiau prieinamas

- **llama3.2:3b** (mažesnis modelis)
  - Mažiau resursų reikalauja
  - Greitesnis atsakymas
  - Šiek tiek mažesnis tikslumas

### System Prompt

LLM naudoja specialų system prompt'ą, kuris:
- Apibrėžia palaikomus POI tipus (lietuviškai → angliškai)
- Nurodo Lietuvos miestus
- Atpažįsta žinomus orientyrus
- Nurodo grąžinti JSON formatą

Žiūrėti pilną prompt'ą: `src/lib/llm.ts`

## Struktūrizuotas išvestis

LLM grąžina JSON objektą:

```typescript
{
  poiType?: string;      // POI tipas (pvz., "bar", "hospital")
  landmark?: string;      // Orientyras (pvz., "Baltas angelas")
  city?: string;          // Miestas (pvz., "Vilnius")
  keywords?: string[];    // Papildomi raktažodžiai
  radius?: number;        // Paieškos spindulys metrais (default: 5000)
}
```

## PostgreSQL Užklausos

### POI lentelė

```sql
places.poi (
  id serial,
  osm_id bigint,
  obj_type char,        -- 'n' (node), 'w' (way), 'r' (relation)
  attr jsonb,           -- POI atributai (name, amenity, shop, etc.)
  geom geometry(point,3857)  -- PostGIS geometrija (Web Mercator)
)
```

### Paieškos logika

1. **Rasti centrą**: pagal orientyrą arba miestą
2. **Filtruoti**: pagal POI tipą ir raktažodžius
3. **Riboti**: pagal atstumą nuo centro
4. **Rūšiuoti**: pagal atstumą (arčiausi pirmi)
5. **Limitas**: 20 rezultatų

Pavyzdys:
```sql
SELECT 
  id, name, latitude, longitude,
  ST_Distance(geom, center) as distance
FROM places.poi
WHERE 
  attr->>'amenity' = 'bar'
  AND ST_Distance(geom, center) <= 5000
ORDER BY distance
LIMIT 20
```

## API Naudojimas

### GET užklausa

```bash
curl "http://localhost:3000/api/search?q=baras%20vilniuje"
```

### POST užklausa

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "ligoninė šalia Žirmūnų tilto"}'
```

### Atsakymo formatas

```json
{
  "query": "baras vilniuje prie balto angelo",
  "interpretation": {
    "poiType": "bar",
    "landmark": "Baltas angelas",
    "city": "Vilnius",
    "keywords": ["baras"],
    "radius": 5000
  },
  "results": [
    {
      "id": 12345,
      "osm_id": 987654321,
      "obj_type": "n",
      "name": "Pavyzdinio baro pavadinimas",
      "type": "bar",
      "latitude": 54.687157,
      "longitude": 25.279652,
      "distance": 150
    }
  ],
  "count": 1
}
```

## Testavimas

### 1. Patikrinti vLLM servisą

```bash
curl http://localhost:8000/health
```

### 2. Testuoti LLM modelį

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "TildeAI/TildeOpen-30b",
    "messages": [{"role": "user", "content": "Kas yra Vilnius?"}],
    "max_tokens": 100
  }'
```

### 3. Testuoti paieškos API

```bash
# Paprastas testas
curl "http://localhost:3000/api/search?q=baras%20vilniuje"

# Su orientyru
curl "http://localhost:3000/api/search?q=ligoninė%20šalia%20Žirmūnų"

# Su miestu ir tipu
curl "http://localhost:3000/api/search?q=plovykla%20kaune"
```

## Troubleshooting

### Problema: "vLLM API klaida"

**Sprendimas:**
```bash
# Patikrinti ar vLLM veikia
docker ps | grep vllm

# Paleisti vLLM
docker-compose up -d vllm

# Peržiūrėti vLLM logs
docker-compose logs -f vllm
```

### Problema: Modelis neįsikelė

**Sprendimas:**
```bash
# Patikrinti vLLM būklę
curl http://localhost:8000/health

# Peržiūrėti logs (modelio atsisiuntimas gali užtrukti)
docker-compose logs -f vllm

# Jei nepakanka VRAM, patikrinkite GPU atmintį
nvidia-smi
```

### Problema: GPU klaidos arba neturite GPU

**Sprendimas:**
- TildeOpen-30b reikalauja ~60GB VRAM
- Reikalingas NVIDIA GPU (A100, H100 ar panašus)
- Be GPU modelio negalima paleisti
- Alternatyva: naudoti cloud GPU servisą (AWS, GCP, Azure)

### Problema: Lėtos paieškos užklausos

**Sprendimas:**
- Pirmasis modelio atsakymas gali užtrukti 3-10 sekundžių
- vLLM naudoja KV cache greitesniam atsakymui
- Patikrinti GPU utilizaciją: `nvidia-smi`
- Padidinti `--gpu-memory-utilization` docker-compose.yml

### Problema: Prastos paieškos rezultatai

**Sprendimas:**
- TildeOpen-30b optimizuotas lietuvių kalbai
- Patikrinti system prompt'ą `src/lib/llm.ts`
- Pridėti daugiau lietuviškų pavyzdžių į prompt'ą
- Reguliuoti temperature parametrą (default: 0.3)

## Plėtros galimybės

### Galimi patobulinimai:

1. **Cache sistema**
   - Saugoti dažnas užklausas
   - Greitesni atsakymai

2. **Istorijos funkcija**
   - Saugoti paskutines paieškas
   - Greita prieiga

3. **Geresnis POI tipų mapping**
   - Daugiau lietuviškų sinonimų
   - Fuzzy matching

4. **Multi-modal paieška**
   - Kombinuoti tekstą ir žemėlapio vietą
   - "Kas yra šalia manęs?"

5. **Sugestijos**
   - Auto-complete paieškos laukelyje
   - Populiariausios paieškos

6. **Analitika**
   - Kokios užklausos dažniausios
   - Kurie POI tipai populiariausi

## Performance

### LLM Response Time
- Pirma užklausa: 3-10 sekundžių (TildeOpen-30b didelis modelis)
- Po KV cache: 1-3 sekundės
- Su GPU: optimal performance
- Be GPU: neveikia

### Database Query Time
- Su indeksais: <100ms
- Be indeksų: 1-2 sekundės
- PostGIS spatial index sugreitina

### Bendras laikas
- Su vLLM: 3-12 sekundžių
- Su fallback (be LLM): <1 sekundė

### Hardware Requirements
- GPU: NVIDIA su ~60GB VRAM (A100, H100)
- RAM: 16GB+ system RAM
- Storage: 70GB+ (modelis ~60GB)

## Saugumas

### API Rate Limiting
Rekomenduojama pridėti:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Rate limiting logika
}
```

### Input Validation
- Maksimalus query ilgis: 200 simbolių
- Sanitizacija prieš SQL užklausas
- LLM response validacija

### Docker Security
- vLLM veikia isolated konteineryje
- Tik local network prieiga (ne public)
- Nėra sensitive data LLM prompt'uose
- GPU prieiga kontroliuojama Docker

## Licencija

Šis funkcionalumas yra dalis openmap.lt projekto ir naudoja:
- vLLM (Apache License 2.0)
- TildeOpen-30b modelis (patikrinti Tilde AI licenciją)
- OpenAI API format (compatibility layer)
