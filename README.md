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

## API Endpoints

Projektas turi pavyzdinius API endpoints, kurie demonstruoja darbą su PostgreSQL + PostGIS:

### Gauti visas vietas
```bash
GET /api/places
```

### Sukurti naują vietą
```bash
POST /api/places
Content-Type: application/json

{
  "name": "Pavadinimas",
  "description": "Aprašymas",
  "longitude": 25.2797,
  "latitude": 54.6872
}
```

**Pastaba:** Koordinatės turi būti Lietuvos ribose:
- Longitude: 20.7 iki 27.05
- Latitude: 53.7 iki 56.65

### Rasti artimas vietas
```bash
GET /api/places/nearby?longitude=25.2797&latitude=54.6872&radius=10000
```

Parametrai:
- `longitude` - ilguma (privalomas, 20.7-27.05)
- `latitude` - platuma (privalomas, 53.7-56.65)
- `radius` - spindulys metrais (neprivalomas, pagal nutylėjimą 10000m, max 1000000m)

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

- **places** lentelė - saugo vietas su geografiniais duomenimis
  - id (SERIAL PRIMARY KEY)
  - name (VARCHAR)
  - description (TEXT)
  - location (GEOGRAPHY POINT)
  - created_at (TIMESTAMP)

PostGIS funkcijos, kurios naudojamos pavyzdiniuose API:
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
