# Deployment į Production Serverį

Šis dokumentas aprašo kaip sukonfigūruoti ir paleisti automatinį deployment į production serverį per GitHub Actions.

## Prieš pradedant

### 1. Serveryje reikalinga aplinka

Serveryje turi būti įdiegta:
- Docker ir Docker Compose
- PostgreSQL su PostGIS (ne Docker, o tiesiogiai serveryje)
- SSH prieiga

### 2. PostgreSQL konfigūracija serveryje

Įsitikinkite, kad PostgreSQL duomenų bazė sukurta ir sukonfigūruota:

```sql
CREATE DATABASE openmap;
CREATE USER openmap WITH ENCRYPTED PASSWORD 'jūsų_saugus_slaptažodis';
GRANT ALL PRIVILEGES ON DATABASE openmap TO openmap;

-- Prisijunkite prie openmap duomenų bazės
\c openmap

-- Sukurkite PostGIS plėtinį
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3. GitHub Secrets konfigūracija

GitHub repository Settings → Secrets and variables → Actions, pridėkite šiuos secrets:

#### Būtini secrets:
- `SSH_HOST` - Serverio IP adresas arba domain (pvz., `123.45.67.89` arba `server.example.com`)
- `SSH_USERNAME` - SSH vartotojo vardas (pvz., `ubuntu` arba `root`)
- `SSH_PRIVATE_KEY` - SSH private key (visa turinys)
- `DATABASE_URL` - PostgreSQL connection string (pvz., `postgresql://openmap:slaptažodis@localhost:5432/openmap`)

#### Pasirenkamas secrets:
- `SSH_PORT` - SSH portas (default: `22`)
- `DEPLOY_PATH` - Kelias serveryje kur bus deployment (default: `/opt/openmap`)

### 4. SSH Private Key generavimas

Jei neturite SSH key, sugeneruokite:

```bash
ssh-keygen -t ed25519 -C "github-actions@openmap.lt" -f ~/.ssh/github_actions
```

Pridėkite public key į serverį:

```bash
ssh-copy-id -i ~/.ssh/github_actions.pub user@server
```

Nukopijuokite private key turinį ir įdėkite į GitHub Secrets kaip `SSH_PRIVATE_KEY`:

```bash
cat ~/.ssh/github_actions
```

## Deployment procesas

### Automatinis deployment

Deployment vyksta automatiškai kai:
1. Sukuriamas naujas git tag su version numeriu (pvz., `v1.0.0`)
2. Arba rankiniu būdu paleistas per GitHub Actions UI

### Rankiniu būdu

1. Eikite į GitHub repository → Actions → "Deploy to Production"
2. Spauskite "Run workflow"
3. Pasirinkite branch ir tag (default: `latest`)
4. Spauskite "Run workflow"

### Naujo release sukūrimas

```bash
# 1. Commit visi pakeitimai
git add .
git commit -m "Release v1.0.0"

# 2. Sukurti tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# 3. Push tag į GitHub
git push origin v1.0.0
```

Po to GitHub Actions automatiškai:
1. Pastatys Docker image
2. Push'ins į GitHub Container Registry
3. Prisijungs prie serverio per SSH
4. Patrauks naują image
5. Perkels konteinerį

## Serveryje

### Deployment struktūra

```
/opt/openmap/
├── .env                        # Aplinkos kintamieji
├── docker-compose.prod.yml     # Production docker-compose
└── (sukuriama automatiškai per deployment)
```

### .env failas serveryje

```env
DATABASE_URL=postgresql://openmap:slaptažodis@localhost:5432/openmap
GITHUB_REPOSITORY=openmaplt/openmap.lt
```

### Konteinerio valdymas

```bash
# Patikrinti status
cd /opt/openmap
docker compose -f docker-compose.prod.yml ps

# Peržiūrėti logs
docker compose -f docker-compose.prod.yml logs -f

# Restart konteinerio
docker compose -f docker-compose.prod.yml restart

# Sustabdyti
docker compose -f docker-compose.prod.yml down

# Paleisti
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### 1. Konteineris negali prisijungti prie PostgreSQL

Patikrinkite PostgreSQL konfigūraciją:

```bash
# Patikrinkite ar PostgreSQL klauso ant 0.0.0.0 arba localhost
sudo nano /etc/postgresql/*/main/postgresql.conf
# Raskite: listen_addresses = 'localhost'

# Patikrinkite pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Pridėkite: host    openmap    openmap    172.17.0.0/16    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 2. SSH connection fails

Patikrinkite:
- Ar SSH_HOST teisingas
- Ar SSH_USERNAME teisingas  
- Ar SSH_PRIVATE_KEY pilnas (su `-----BEGIN...` ir `-----END...`)
- Ar serveris priima connections

```bash
# Test SSH connection
ssh -i ~/.ssh/github_actions user@server
```

### 3. Docker image pull fails

Patikrinkite ar GitHub Container Registry paketas yra public arba ar turite teises:

```bash
# Serveryje, login į GHCR
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

## Monitoring

### Aplikacijos status

```bash
# Patikrinti ar veikia
curl http://localhost:3000/api/places

# Peržiūrėti logs
docker compose -f docker-compose.prod.yml logs -f app
```

### PostgreSQL status

```bash
# Prisijungti prie DB
psql -U openmap -d openmap

# Patikrinti connections
SELECT * FROM pg_stat_activity WHERE datname = 'openmap';
```

## Security

### Rekomenduojama:

1. Naudokite firewall (ufw/iptables) riboti prieigą prie PostgreSQL
2. Naudokite stiprius slaptažodžius
3. Reguliariai atnaujinkite dependencies
4. Setup SSL/TLS sertifikatus (pvz., su nginx reverse proxy)
5. Backup duomenų bazę reguliariai

### Backup

```bash
# PostgreSQL backup
pg_dump -U openmap -d openmap > backup_$(date +%Y%m%d).sql

# Restore
psql -U openmap -d openmap < backup_20241031.sql
```
