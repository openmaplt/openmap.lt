# Natūralios Kalbos Paieška / Natural Language Search

## Apžvalga

Openmap.lt projektas palaiko natūralios lietuvių kalbos paiešką naudodamas LLM (Large Language Model) modelį, kuris veikia Docker konteineryje per Ollama platformą.

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
   - Bendrauja su Ollama API
   - Naudoja system prompt'ą lietuvių kalbos interpretavimui
   - Grąžina struktūrizuotus duomenis (JSON)

4. **Database Search (lib/searchDb.ts)**
   - Konstruoja PostgreSQL užklausas pagal LLM interpretaciją
   - Naudoja PostGIS funkcijas atstumų skaičiavimui
   - Grąžina POI sąrašą su koordinatėmis

5. **Ollama Docker Service**
   - Lokalus LLM serveris
   - Palaiko TildeOpen, Llama ir kitus modelius
   - API per port 11434

### Duomenų srautas

```
Vartotojas → SearchBar → /api/search → LLM (Ollama) → searchPOI() → PostgreSQL → Rezultatai → Žemėlapis
```

## LLM Modelis

### Palaikomi modeliai

- **tildeopen:latest** (rekomenduojama lietuvių kalbai)
  - Sukurtas Tilde AI
  - Optimizuotas lietuvių kalbai
  - Geriausias lietuviškų užklausų supratimas

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

### 1. Patikrinti Ollama servisą

```bash
curl http://localhost:11434/api/tags
```

### 2. Testuoti LLM modelį

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "tildeopen:latest",
  "prompt": "Kas yra Vilnius?",
  "stream": false
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

### Problema: "Ollama API klaida"

**Sprendimas:**
```bash
# Patikrinti ar Ollama veikia
docker ps | grep ollama

# Paleisti Ollama
docker-compose up -d ollama

# Peržiūrėti Ollama logs
docker-compose logs -f ollama
```

### Problema: Modelis nerastas

**Sprendimas:**
```bash
# Patikrinti įdiegtus modelius
docker exec -it openmap-ollama ollama list

# Įdiegti modelį
./scripts/setup-llm.sh
```

### Problema: Lėtos paieškos užklausos

**Sprendimas:**
- LLM atsakymas gali užtrukti 2-5 sekundes pirmą kartą
- Sekantys užklausos bus greitesnės (cache)
- Naudoti mažesnį modelį (llama3.2:3b)
- Padidinti Docker resursus (CPU/RAM)

### Problema: Prastos paieškos rezultatai

**Sprendimas:**
- Patikrinti ar naudojamas tinkamas modelis lietuvių kalbai (TildeOpen)
- Patikrinti system prompt'ą `src/lib/llm.ts`
- Pridėti daugiau pavyzdžių į system prompt'ą
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
- Pirma užklausa: 2-5 sekundės
- Cache hit: <1 sekundė
- Priklauso nuo modelio dydžio

### Database Query Time
- Su indeksais: <100ms
- Be indeksų: 1-2 sekundės
- PostGIS spatial index sugreitina

### Bendras laikas
- Su LLM: 2-6 sekundės
- Su fallback (be LLM): <1 sekundė

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
- Ollama veikia isolated konteineryje
- Tik local network prieiga (ne public)
- Nėra sensitive data LLM prompt'uose

## Licencija

Šis funkcionalumas yra dalis openmap.lt projekto ir naudoja:
- Ollama (MIT License)
- TildeOpen modelis (patikrinti Tilde AI licenciją)
- Llama modeliai (Meta Llama license)
