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
