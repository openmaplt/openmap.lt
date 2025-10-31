# PostgreSQL + PostGIS su Docker - Dokumentacija

## Apžvalga

Šis projektas naudoja PostgreSQL su PostGIS plėtiniu geografiniams duomenims tvarkyti. Viskas veikia per Docker, todėl nereikia diegti PostgreSQL į jūsų kompiuterį.

## Greitas startas

### 1. Paleisti duomenų bazę
```bash
docker compose up -d
```

### 2. Paleisti Next.js projektą
```bash
npm run dev
```

### 3. Testuoti API
```bash
# Gauti visas vietas
curl http://localhost:3000/api/places

# Sukurti naują vietą
curl -X POST http://localhost:3000/api/places \
  -H "Content-Type: application/json" \
  -d '{"name":"Testas","description":"Test","longitude":25.0,"latitude":54.0}'

# Rasti artimas vietas (50km spinduliu)
curl "http://localhost:3000/api/places/nearby?longitude=25.2797&latitude=54.6872&radius=50000"
```

## Duomenų bazės konfigūracija

### Prisijungimo duomenys
- **Host**: localhost
- **Port**: 5432
- **Database**: openmap
- **User**: openmap
- **Password**: openmap

### Connection String
```
postgresql://openmap:openmap@localhost:5432/openmap
```

## Docker komandos

### Paleisti
```bash
docker compose up -d
```

### Sustabdyti
```bash
docker compose stop
```

### Paleisti iš naujo
```bash
docker compose restart
```

### Peržiūrėti logs
```bash
docker compose logs -f postgres
```

### Prisijungti prie PostgreSQL
```bash
docker compose exec postgres psql -U openmap -d openmap
```

### Išjungti ir ištrinti duomenis
```bash
docker compose down -v
```

## API Endpoints

### GET /api/places
Gauti visas vietas iš duomenų bazės.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Vilnius",
      "description": "Lietuvos sostinė",
      "longitude": 25.2797,
      "latitude": 54.6872,
      "created_at": "2025-10-31T22:33:21.172Z"
    }
  ],
  "count": 1
}
```

### POST /api/places
Sukurti naują vietą.

**Request:**
```json
{
  "name": "Pavadinimas",
  "description": "Aprašymas (optional)",
  "longitude": 25.2797,
  "latitude": 54.6872
}
```

**Koordinačių validacija:**
- Longitude: 20.7 iki 27.05 (Lietuvos ribos)
- Latitude: 53.7 iki 56.65 (Lietuvos ribos)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Pavadinimas",
    "description": "Aprašymas",
    "longitude": 25.2797,
    "latitude": 54.6872,
    "created_at": "2025-10-31T22:36:27.955Z"
  }
}
```

### GET /api/places/nearby
Rasti vietas per nurodytą spindulį nuo taško.

**Query parametrai:**
- `longitude` (required) - ilguma (20.7 iki 27.05 - Lietuvos ribos)
- `latitude` (required) - platuma (53.7 iki 56.65 - Lietuvos ribos)
- `radius` (optional) - spindulys metrais (default: 10000, max: 1000000)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Vilnius",
      "description": "Lietuvos sostinė",
      "longitude": 25.2797,
      "latitude": 54.6872,
      "distance_meters": 0,
      "created_at": "2025-10-31T22:33:21.172Z"
    }
  ],
  "count": 1,
  "params": {
    "longitude": 25.2797,
    "latitude": 54.6872,
    "radius": 50000
  }
}
```

## Duomenų bazės struktūra

### places lentelė

```sql
CREATE TABLE places (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX places_location_idx ON places USING GIST(location);
```

### PostGIS funkcijos

Projektas naudoja šias PostGIS funkcijas:

#### ST_GeogFromText
Sukuria geografinį tašką iš WKT (Well-Known Text) formato.
```sql
ST_GeogFromText('POINT(25.2797 54.6872)')
```

#### ST_Distance
Apskaičiuoja atstumą tarp dviejų geografinių taškų metrais.
```sql
ST_Distance(location, ST_GeogFromText('POINT(25.2797 54.6872)'))
```

#### ST_DWithin
Patikrina ar taškas yra per nurodytą atstumą nuo kito taško.
```sql
ST_DWithin(location, ST_GeogFromText('POINT(25.2797 54.6872)'), 10000)
```

#### ST_X / ST_Y
Gauna X (longitude) ir Y (latitude) koordinates iš geometrijos.
```sql
ST_X(location::geometry) as longitude,
ST_Y(location::geometry) as latitude
```

## Programavimas

### Prisijungimas prie duomenų bazės

```typescript
import { query } from "@/lib/db";

const result = await query("SELECT * FROM places");
```

### SQL užklausos pavyzdžiai

```typescript
// SELECT
const result = await query("SELECT * FROM places WHERE id = $1", [1]);

// INSERT
const result = await query(
  "INSERT INTO places (name, location) VALUES ($1, ST_GeogFromText($2)) RETURNING *",
  ["Vilnius", "POINT(25.2797 54.6872)"]
);

// UPDATE
const result = await query(
  "UPDATE places SET name = $1 WHERE id = $2",
  ["Naujas pavadinimas", 1]
);

// DELETE
const result = await query("DELETE FROM places WHERE id = $1", [1]);
```

## Troubleshooting

### PostgreSQL nepasiekiamas
```bash
# Patikrinti ar konteineris veikia
docker compose ps

# Peržiūrėti logs
docker compose logs postgres

# Paleisti iš naujo
docker compose restart postgres
```

### Duomenų bazės reset
```bash
# Ištrinti visą duomenų bazę ir sukurti iš naujo
docker compose down -v
docker compose up -d
```

### Prisijungti prie duomenų bazės
```bash
# Per Docker
docker compose exec postgres psql -U openmap -d openmap

# Tiesiogiai (jei turite psql)
psql postgresql://openmap:openmap@localhost:5432/openmap
```

## Pavyzdiniai SQL queries

### Gauti visas vietas
```sql
SELECT 
  id, 
  name, 
  ST_X(location::geometry) as longitude,
  ST_Y(location::geometry) as latitude
FROM places;
```

### Rasti vietas per 50km spindulį
```sql
SELECT 
  name,
  ST_Distance(
    location,
    ST_GeogFromText('POINT(25.2797 54.6872)')
  ) / 1000 as distance_km
FROM places
WHERE ST_DWithin(
  location,
  ST_GeogFromText('POINT(25.2797 54.6872)'),
  50000
)
ORDER BY distance_km;
```

### Rasti artimiausią vietą
```sql
SELECT 
  name,
  ST_Distance(
    location,
    ST_GeogFromText('POINT(25.2797 54.6872)')
  ) as distance_meters
FROM places
ORDER BY distance_meters
LIMIT 1;
```
