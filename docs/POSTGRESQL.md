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

### GET /api/search
Ieškoti POI vietų pagal pavadinimą, grąžinant artimiausius rezultatus.

**Query parametrai:**
- `f` (required) - paieškos tekstas (ieško name lauke)
- `x` (required) - ilguma / longitude
- `y` (required) - platuma / latitude

**Pavyzdys:**
```bash
curl "http://localhost:3000/api/search?f=vilnius&x=25.2797&y=54.6872"
```

**Response (GeoJSON FeatureCollection):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [25.2797, 54.6872]
      },
      "properties": {
        "id": 1,
        "name": "Vilnius",
        "description": "Lietuvos sostinė, didžiausias šalies miestas",
        "lat": 54.6872,
        "lon": 25.2797,
        "distance": 0
      }
    }
  ]
}
```

**Pastaba:** 
- API grąžina iki 10 artimiausių rezultatų
- Rezultatai rūšiuojami pagal atstumą nuo nurodyto taško
- POI duomenys importuoti iš OpenStreetMap (OSM)
- API skirtas tik skaitymui

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
