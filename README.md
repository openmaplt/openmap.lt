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

Duomenys yra apibrėžti `docker/test_data.sql` faile (apima ir duomenų bazės struktūrą, ir testinius duomenis).

## API Endpoints

Projektas turi keturis API endpoints POI darbui su PostgreSQL + PostGIS:

### 1. Ieškoti vietų
```bash
GET /api/search?f=vilnius&x=25.2797&y=54.6872
```

Parametrai:
- `f` - paieškos tekstas (privalomas)
- `x` - ilguma / longitude (privalomas)
- `y` - platuma / latitude (privalomas)

Atsakymas: GeoJSON FeatureCollection su iki 10 artimiausių rezultatų, rūšiuotų pagal atstumą.

### 2. Gauti POI pagal kategoriją
```bash
GET /api/category?type=A
```

Parametrai:
- `type` - kategorijos tipas (privalomas): A (piliakalniai), B (pilkapynai), C (dvarai), D (paminklai), E (istorinės vietos), F (bokštai), G (lankytinos vietos), H (regyklos), I (muziejai), J (katalikų bažnyčios), K (liuteronų bažnyčios), L (stačiatikių bažnyčios), M (kitos religijos), X (vienuolynai), 1 (pažintiniai takai), 2 (policija), 3 (gamtos objektai)

Atsakymas: Sąrašas POI taškų pagal kategoriją (iki 100 rezultatų).

### 3. Gauti POI informaciją
```bash
GET /api/info?id=1
```

Parametrai:
- `id` - POI identifikatorius (privalomas)

Atsakymas: Detali POI informacija.

### 4. Gauti POI sąrašą žemėlapio viewport'ui
```bash
GET /api/list?bbox=20.7,53.7,27.05,56.65&type=bn
```

Parametrai:
- `bbox` - bounding box (privalomas): left,bottom,right,top koordinatės
- `type` - POI tipai (privalomas): vienas ar keli tipo kodai (a-z, A-Z, 0-3)

Atsakymas: GeoJSON FeatureCollection su POI taškais bounding box ribose (iki 1000 rezultatų).

**Pastaba:** POI duomenys bus importuoti iš OSM duomenų bazės. Visi API endpoints skirti tik duomenų skaitymui.

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

Pradinė duomenų bazės struktūra ir testiniai duomenys sukuriami automatiškai per `docker/test_data.sql` skriptą:

- **places** lentelė - saugo POI (Point of Interest) duomenis
  - id (SERIAL PRIMARY KEY)
  - name (VARCHAR) - POI pavadinimas
  - description (TEXT) - POI aprašymas
  - location (GEOGRAPHY POINT) - geografinė koordinatė
  - created_at (TIMESTAMP) - sukūrimo data

**Testiniai duomenys:** Lokaliam development'ui automatiškai įkeliami testiniai POI duomenys (~90+ taškų Lietuvoje) iš to paties `docker/test_data.sql` failo.

**Production duomenys:** Bus importuoti iš OpenStreetMap (OSM) duomenų bazės.

PostGIS funkcijos, kurios naudojamos API:
- `ST_GeogFromText()` - sukurti geografinį tašką
- `ST_Distance()` - apskaičiuoti atstumą tarp taškų
- `ST_AsGeoJSON()` - konvertuoti geometriją į GeoJSON formatą
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
