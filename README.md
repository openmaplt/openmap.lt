# openmap_app
Nauja openmap.lt aplikacijos versija

## Technologijos
- Node.js >= v24
- Next.js 15
- TypeScript
- Tailwind CSS
- PostgreSQL + PostGIS (per Docker)
- Ollama LLM (per Docker) - natūralios kalbos paieška

## Pradžia

### 1. Instaliuoti priklausomybes
```bash
npm install
```

### 2. Paleisti Docker servisus (PostgreSQL + Ollama LLM)
```bash
docker-compose up -d
```

Ši komanda paleis:
- **PostgreSQL 16** su PostGIS 3.5 plėtiniu (`localhost:5432`)
- **Ollama LLM** servisą natūralios kalbos paieškai (`localhost:11434`)

### 2.1. Įdiegti LLM modelį (TildeOpen arba Llama)

**Greitas būdas - naudoti setup scriptą:**
```bash
./scripts/setup-llm.sh
```

Script'as automatiškai:
- Patikrina ar Ollama veikia
- Leidžia pasirinkti modelį (TildeOpen / Llama 3.2)
- Atsisiunčia pasirinktą modelį
- Atnaujina `.env.local` failą

**Rankinis būdas:**

**Pasirinkimas A: TildeOpen modelis (rekomenduojama lietuvių kalbai)**
```bash
# Paleisti Ollama konteinerį ir įdiegti TildeOpen modelį
docker exec -it openmap-ollama ollama pull tildeopen:latest
```

**Pasirinkimas B: Llama 3.2 modelis (alternatyva, jei TildeOpen nepasiekiamas)**
```bash
docker exec -it openmap-ollama ollama pull llama3.2:latest
```

**Patikrinti ar modelis įdiegtas:**
```bash
docker exec -it openmap-ollama ollama list
```

Jei naudojate Llama vietoj TildeOpen, atnaujinkite `.env.local`:
```bash
OLLAMA_MODEL=llama3.2:latest
```

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
- Ollama URL: `http://localhost:11434`
- Ollama Model: `tildeopen:latest`

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

1. **LLM interpretacija**: Ollama su TildeOpen modeliu interpretuoja natūralią lietuvių kalbos užklausą
2. **Struktūrizavimas**: LLM išgauna POI tipą, orientyrą, miestą ir papildomus raktažodžius
3. **DB užklausa**: Sistema sugeneruoja PostgreSQL užklausą į OSM duomenų bazę
4. **Rezultatai**: Surandami atitinkami POI objektai su koordinatėmis
5. **Žemėlapis**: Rezultatai rodomi sąraše ir žemėlapis nukelia į pasirinktą vietą

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
docker-compose logs -f ollama
```

### Testuoti LLM servisą
```bash
# Patikrinti ar Ollama veikia
curl http://localhost:11434/api/tags

# Testuoti modelio atsakymą
curl http://localhost:11434/api/generate -d '{
  "model": "tildeopen:latest",
  "prompt": "Kas yra Vilnius?",
  "stream": false
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
