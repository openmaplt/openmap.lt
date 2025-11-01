# openmap_app
Nauja openmap.lt aplikacijos versija

## Technologijos
- Node.js >= v24
- Next.js 15
- TypeScript
- Tailwind CSS
- PostgreSQL + PostGIS (per Docker)

## Pradžia

### 1. Instaliuoti priklausomybes
```bash
npm install
```

### 2. Paleisti PostgreSQL su PostGIS (Docker)
```bash
docker-compose up -d
```

Ši komanda paleis PostgreSQL 16 su PostGIS 3.5 plėtiniu. Duomenų bazė bus prieinama adresu `localhost:5432`.

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

### 4. Paleisti projektą
```bash
npm run dev
```

Aplikacija bus prieinama adresu: http://localhost:3000

## Testiniai duomenys

Paleidus PostgreSQL pirmą kartą, automatiškai bus užkrauti testiniai POI duomenys (~90+ taškų):
- Didžiųjų miestų centrai (Vilnius, Kaunas, Klaipėda, Šiauliai, Panevėžys)
- Istoriniai objektai ir muziejai
- Gamtos objektai ir nacionaliniai parkai
- Religiniai objektai
- Kurortai ir poilsio vietos
- Mažesni miestai ir miesteliai
- Paminklai ir memorialai

Duomenys yra apibrėžti `docker/sample-data.sql` faile.

## API Endpoints

Projektas turi API endpoints darbui su PostgreSQL + PostGIS:

### Gauti visas vietas
```bash
GET /api/places
```

### Rasti artimas vietas
```bash
GET /api/places/nearby?longitude=25.2797&latitude=54.6872&radius=10000
```

Parametrai:
- `longitude` - ilguma (privalomas)
- `latitude` - platuma (privalomas)
- `radius` - spindulys metrais (neprivalomas, pagal nutylėjimą 10000m, max 1000000m)

**Pastaba:** POI duomenys bus importuoti iš OSM duomenų bazės. API endpoints skirtas tik duomenų skaitymui.

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
```

## Duomenų bazės struktūra

Pradinė duomenų bazės struktūra sukuriama automatiškai per `docker/init-db.sql` skriptą:

- **places** lentelė - saugo POI (Point of Interest) duomenis
  - id (SERIAL PRIMARY KEY)
  - name (VARCHAR) - POI pavadinimas
  - description (TEXT) - POI aprašymas
  - location (GEOGRAPHY POINT) - geografinė koordinatė
  - created_at (TIMESTAMP) - sukūrimo data

**Testiniai duomenys:** Lokaliam development'ui automatiškai įkeliami testiniai POI duomenys iš `docker/sample-data.sql` (~90+ taškų Lietuvoje).

**Production duomenys:** Bus importuoti iš OpenStreetMap (OSM) duomenų bazės.

PostGIS funkcijos, kurios naudojamos API:
- `ST_GeogFromText()` - sukurti geografinį tašką
- `ST_Distance()` - apskaičiuoti atstumą tarp taškų
- `ST_DWithin()` - rasti taškus per nurodytą spindulį
- `ST_X()`, `ST_Y()` - gauti koordinates

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
