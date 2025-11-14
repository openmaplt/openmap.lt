# openmap_app
Nauja openmap.lt aplikacijos versija

## Technologijos
- Node.js >= v24
- Next.js 15
- TypeScript
- Tailwind CSS
- PostgreSQL + PostGIS (per Docker)
- vLLM su TildeOpen-30b (per Docker) - natūralios kalbos paieška

## Pradžia

### 1. Instaliuoti priklausomybes
```bash
npm install
```

### 2. Paleisti Docker servisus (PostgreSQL + vLLM)
```bash
docker-compose up -d
```

Ši komanda paleis:
- **PostgreSQL 16** su PostGIS 3.5 plėtiniu (`localhost:5432`)
- **vLLM** servisą su TildeOpen-30b modeliu (`localhost:8000`)

### 2.1. Įdiegti ir paleisti TildeOpen-30b modelį

**⚠️ Reikalavimai:**
- NVIDIA GPU su bent 60GB VRAM (pvz., A100, H100)
- NVIDIA Docker runtime
- Interneto ryšys modelio atsisiuntimui (~60GB)

**Setup scriptas (rekomenduojama):**
```bash
./scripts/setup-llm.sh
```

Script'as automatiškai:
- Patikrina GPU prieinamumą
- Paleidžia vLLM konteinerį
- Atsisiunčia TildeOpen-30b iš HuggingFace
- Įkelia modelį į GPU atmintį
- Konfigūruoja `.env.local`

**Rankinis būdas:**
```bash
# Paleisti tik vLLM servisą
docker-compose up -d vllm

# Stebėti progresą (modelio atsisiuntimas gali užtrukti)
docker-compose logs -f vllm

# Patikrinti ar servisas veikia
curl http://localhost:8000/health
```

**Jei neturite GPU:**
TildeOpen-30b modelis reikalauja GPU. Be GPU galite naudoti mažesnį modelį arba cloud sprendimą.

### 3. Sukonfigūruoti aplinkos kintamuosius
Nukopijuokite `.env.example` į `.env.local`:
```bash
cp .env.example .env.local
```

Pagal nutylėjimą naudojama:
- Database: `openmap`
- User: `openmap`
- Password: `openmap`
- Port: `5432`
- vLLM URL: `http://localhost:8000`
- vLLM Model: `TildeAI/TildeOpen-30b`

### 4. Paleisti projektą
```bash
npm run dev
```

Aplikacija bus prieinama adresu: http://localhost:3000

## Natūralios kalbos paieška

Aplikacija palaiko natūralios lietuvių kalbos paiešką naudodama LLM modelį. Paieškos laukelis yra viršuje žemėlapio centre.

### Pavyzdžiai:
- "baras vilniuje prie balto angelo"
- "parodyk ligoninę šalia Žirmūnų tilto"
- "kur yra automobilių plovykla netoli Mega Kaune"
- "surask kempingą netoli Trakų ežerų"
- "koks yra artimiausias paštas nuo Vingio parko"

### Kaip veikia:

1. **LLM interpretacija**: vLLM su TildeOpen-30b modeliu interpretuoja natūralią lietuvių kalbos užklausą
2. **Struktūrizavimas**: LLM išgauna POI tipą, orientyrą, miestą ir papildomus raktažodžius
3. **DB užklausa**: Sistema sugeneruoja PostgreSQL užklausą į OSM duomenų bazę
4. **Rezultatai**: Surandami atitinkami POI objektai su koordinatėmis
5. **Žemėlapis**: Rezultatai rodomi sąraše ir žemėlapis nukelia į pasirinktą vietą

### Kodėl TildeOpen-30b?

TildeOpen-30b yra specialiai lietuvių kalbai optimizuotas didelis kalbos modelis, sukurtas Tilde AI:
- 🇱🇹 Puikus lietuvių kalbos supratimas
- 📍 Gerai atpažįsta Lietuvos miestus ir orientyrus
- 🎯 Tikslesnis POI tipo nustatymas lietuviškais terminais
- 🚀 Profesionalus modelis, skirtas gamybinei aplinkai

### API Endpoint:
```bash
# GET užklausa
curl "http://localhost:3000/api/search?q=baras%20vilniuje"

# POST užklausa
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "ligoninė šalia Žirmūnų tilto"}'
```

## Docker valdymas

### Sustabdyti duomenų bazę
```bash
docker-compose stop
```

### Paleisti iš naujo
```bash
docker-compose start
```

### Išjungti ir išvalyti duomenis
```bash
docker-compose down -v
```

### Peržiūrėti logs
```bash
docker-compose logs -f postgres
docker-compose logs -f vllm
```

### Testuoti vLLM servisą
```bash
# Patikrinti ar vLLM veikia
curl http://localhost:8000/health

# Testuoti modelio atsakymą
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "TildeAI/TildeOpen-30b",
    "messages": [{"role": "user", "content": "Kas yra Vilnius?"}],
    "max_tokens": 100
  }'
```

## Vystymas

### Linting
```bash
npm run lint
```

### Formatavimas
```bash
npm run format
```

### Build
```bash
npm run build
```

## Production Deployment

Projektas turi automatinį deployment į production serverį per GitHub Actions. Detali dokumentacija: [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

### Greitas startas:

1. Sukonfigūruokite GitHub Secrets (žr. [DEPLOYMENT.md](./docs/DEPLOYMENT.md))
2. Sukurkite release tag:
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```
3. GitHub Actions automatiškai deploy'ins į serverį
