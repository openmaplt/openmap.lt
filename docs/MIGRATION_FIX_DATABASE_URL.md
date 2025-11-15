# Migracijos Vadovas: PostgreSQL Prisijungimo Pataisymas

## Problema

Jei matote šias klaidas production serveryje:

```
Klaida vykdant užklausą: AggregateError
  code: 'ECONNREFUSED'
```

Tai reiškia, kad Docker konteineris negali prisijungti prie PostgreSQL duomenų bazės.

## Priežastis

Docker konteineryje veikianti aplikacija bando jungtis prie `localhost:5432`, tačiau `localhost` konteineryje reiškia patį konteinerį, o ne host mašiną kur veikia PostgreSQL.

## Sprendimas

### 1. Atnaujinkite DATABASE_URL

Prisijunkite prie production serverio ir pakeiskite `.env` failą:

```bash
# Prisijunkite prie serverio
ssh user@your-server

# Eikite į deployment direktoriją
cd /opt/openmap

# Redaguokite .env failą
nano .env
```

Pakeiskite DATABASE_URL eilutę:

**Buvo (neteisingai):**
```env
DATABASE_URL=postgresql://openmap:password@localhost:5432/openmap
```

**Turi būti (teisingai):**
```env
DATABASE_URL=postgresql://openmap:password@host.docker.internal:5432/openmap
```

Išsaugokite failą (Ctrl+O, Enter, Ctrl+X).

### 2. Perkraukite konteinerį

```bash
cd /opt/openmap
docker compose -f docker-compose.prod.yml restart
```

### 3. Patikrinkite ar veikia

```bash
# Peržiūrėkite konteinerio žurnalus
docker compose -f docker-compose.prod.yml logs -f app

# Patikrinkite ar API veikia
curl http://localhost:3000/api/list?bbox=20.7,53.7,27.05,56.65&types=abc
```

Jei viskas gerai, turėtumėte matyti JSON atsakymą, o ne klaidas žurnaluose.

## Alternatyvus Sprendimas

Jei `host.docker.internal` neveikia jūsų sistemoje, galite naudoti serverio IP adresą:

```bash
# Sužinokite serverio IP
ip addr show | grep "inet " | grep -v 127.0.0.1

# Pavyzdžiui, jei IP yra 192.168.1.100
DATABASE_URL=postgresql://openmap:password@192.168.1.100:5432/openmap
```

## Patikrinimas

### Patikrinkite PostgreSQL prieinamumą iš host mašinos

```bash
# Bandykite jungtis lokaliai
psql -U openmap -d openmap -h localhost

# Patikrinkite ar PostgreSQL veikia
sudo systemctl status postgresql

# Patikrinkite ar PostgreSQL priima connections
sudo netstat -tlnp | grep 5432
```

### Patikrinkite Docker tinklo konfigūraciją

```bash
# Peržiūrėkite docker-compose.prod.yml
cat /opt/openmap/docker-compose.prod.yml

# Turėtų būti:
#     extra_hosts:
#       - "host.docker.internal:host-gateway"
```

### Patikrinkite konteinerio žurnalus

```bash
# Peržiūrėkite visus žurnalus
docker compose -f docker-compose.prod.yml logs app

# Sekite naujas žinutes realiu laiku
docker compose -f docker-compose.prod.yml logs -f app
```

## Dažni Klausimai

### Q: Kodėl development aplinkoje veikia su localhost?

A: Development aplinkoje PostgreSQL taip pat veikia Docker konteineryje ir abu kontaineriai yra tame pačiame Docker tinkle. Production aplinkoje PostgreSQL veikia tiesiogiai host mašinoje.

### Q: Ar galiu naudoti serverio išorinį IP adresą?

A: Taip, bet tai nėra rekomenduojama, nes tai gali sukelti papildomų saugumo problemų. Geriausia naudoti `host.docker.internal` arba vidinį IP.

### Q: Ar reikia keisti docker-compose.prod.yml failą?

A: Naujesnėje versijoje jau yra `extra_hosts` konfigūracija. Jei jos nėra, atnaujinkite failą naudodami:

```bash
cd /opt/openmap
curl -o docker-compose.prod.yml https://raw.githubusercontent.com/openmaplt/openmap.lt/main/docker-compose.prod.yml
```

### Q: Ką daryti jei vis dar negaunu connection?

A: Patikrinkite:

1. PostgreSQL konfigūraciją (`/etc/postgresql/*/main/postgresql.conf`):
   ```
   listen_addresses = 'localhost'  # Turi būti localhost arba *
   ```

2. PostgreSQL access kontrolę (`/etc/postgresql/*/main/pg_hba.conf`):
   ```
   host    openmap    openmap    172.17.0.0/16    md5
   ```

3. Perkraukite PostgreSQL po pakeitimų:
   ```bash
   sudo systemctl restart postgresql
   ```

## Pagalba

Jei vis dar turite problemų, peržiūrėkite pilną [DEPLOYMENT.md](./DEPLOYMENT.md) dokumentaciją arba susisiekite su komanda.
