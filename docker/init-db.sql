-- Inicializuojame PostGIS plėtinį
CREATE EXTENSION IF NOT EXISTS postgis;

-- Sukuriame pavyzdinę lentelę su geografiniais duomenimis
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Įdedame kelis pavyzdinius taškus Lietuvoje
INSERT INTO places (name, description, location) VALUES
  ('Vilnius', 'Lietuvos sostinė', ST_GeogFromText('POINT(25.2797 54.6872)')),
  ('Kaunas', 'Antrasis pagal dydį miestas', ST_GeogFromText('POINT(23.9036 54.8985)')),
  ('Klaipėda', 'Uostamiestis', ST_GeogFromText('POINT(21.1442 55.7033)'))
ON CONFLICT DO NOTHING;

-- Sukuriame erdvinį indeksą geresniam veikimui
CREATE INDEX IF NOT EXISTS places_location_idx ON places USING GIST(location);
