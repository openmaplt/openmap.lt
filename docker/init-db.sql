-- Inicializuojame PostGIS plėtinį
CREATE EXTENSION IF NOT EXISTS postgis;

-- Sukuriame lentelę su geografiniais duomenimis
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sukuriame erdvinį indeksą geresniam veikimui
CREATE INDEX IF NOT EXISTS places_location_idx ON places USING GIST(location);
