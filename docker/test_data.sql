-- Pavyzdinis duomenų bazės dump failas su testiniais POI duomenimis
-- Naudojimui lokaliam development aplinkoje

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

-- Įdedame testinių POI duomenų Lietuvoje

-- Didžiųjų miestų centrai
INSERT INTO places (name, description, location) VALUES
  ('Vilnius', 'Lietuvos sostinė, didžiausias šalies miestas', ST_GeogFromText('POINT(25.2797 54.6872)')),
  ('Kaunas', 'Antrasis pagal dydį miestas, laikinoji sostinė tarpukariu', ST_GeogFromText('POINT(23.9036 54.8985)')),
  ('Klaipėda', 'Uostamiestis prie Baltijos jūros', ST_GeogFromText('POINT(21.1442 55.7033)')),
  ('Šiauliai', 'Ketvirtas pagal dydį miestas, Saulės miestas', ST_GeogFromText('POINT(23.3161 55.9349)')),
  ('Panevėžys', 'Penktasis pagal dydį miestas, Aukštaitijos sostinė', ST_GeogFromText('POINT(24.3644 55.7351)'))
ON CONFLICT DO NOTHING;

-- Istoriniai objektai ir muziejai Vilniuje
INSERT INTO places (name, description, location) VALUES
  ('Vilniaus Katedra', 'Pagrindinė Lietuvos katalikų katedra Katedros aikštėje', ST_GeogFromText('POINT(25.2876 54.6859)')),
  ('Gedimino pilis', 'Viršutinės pilies bokštas su apžvalgos aikštele', ST_GeogFromText('POINT(25.2899 54.6868)')),
  ('Pilies g.', 'Istorinė gatvė senamiestyje', ST_GeogFromText('POINT(25.2880 54.6820)')),
  ('Trijų Kryžių paminklas', 'Paminklas ant Plikojo (Kryžių) kalno', ST_GeogFromText('POINT(25.3010 54.6843)')),
  ('Vilniaus universitetas', 'Vienas seniausių universitetų Rytų Europoje', ST_GeogFromText('POINT(25.2790 54.6810)')),
  ('Aušros vartai', 'Vieninteliai išlikę iš devynių miesto vartų', ST_GeogFromText('POINT(25.2888 54.6736)')),
  ('Bernardinų sodas', 'Viešasis parkas netoli senamiesčio', ST_GeogFromText('POINT(25.2970 54.6830)')),
  ('Užupis', 'Bohemiškas Vilniaus rajonas su nepriklausomos respublikos statusu', ST_GeogFromText('POINT(25.2960 54.6800)')),
  ('Nacionalinis muziejus', 'Lietuvos nacionalinis muziejus Arsenalo gatvėje', ST_GeogFromText('POINT(25.2895 54.6857)')),
  ('Lietuvos dailės muziejus', 'Pagrindinė nacionalinė dailės kolekcija', ST_GeogFromText('POINT(25.2885 54.6795)'))
ON CONFLICT DO NOTHING;

-- Kauno lankytinos vietos
INSERT INTO places (name, description, location) VALUES
  ('Kauno pilis', 'Gotikinė XIII a. pilis Nemuno ir Neries santakoje', ST_GeogFromText('POINT(23.8867 54.8971)')),
  ('Laisvės alėja', 'Pagrindinė Kauno pėsčiųjų gatvė', ST_GeogFromText('POINT(23.9120 54.8963)')),
  ('Kauno rotušė', 'XVI a. rotušė, vadinama ''Baltąja gulbe''', ST_GeogFromText('POINT(23.8860 54.8965)')),
  ('Soboras', 'Šv. Arkangelo Mykolo Soboras', ST_GeogFromText('POINT(23.8840 54.8990)')),
  ('M.K. Čiurlionio muziejus', 'Didžiausia Čiurlionio kūrinių kolekcija', ST_GeogFromText('POINT(23.8895 54.8955)')),
  ('IX fortas', 'Buvęs fortas, dabar memorialinis muziejus', ST_GeogFromText('POINT(23.8385 54.9340)')),
  ('Kauno marios', 'Dirbtinė mažoji jūra Nemune', ST_GeogFromText('POINT(23.6460 54.8750)')),
  ('Pažaislio vienuolynas', 'XVII a. barokinis vienuolynas', ST_GeogFromText('POINT(23.9750 54.8590)'))
ON CONFLICT DO NOTHING;

-- Klaipėdos lankytinos vietos
INSERT INTO places (name, description, location) VALUES
  ('Klaipėdos senamiestis', 'Istorinis miesto centras', ST_GeogFromText('POINT(21.1270 55.7070)')),
  ('Danės krantinė', 'Promenada palei Danės upę', ST_GeogFromText('POINT(21.1305 55.7090)')),
  ('Smiltynė', 'Kurortas Kuršių nerijoje', ST_GeogFromText('POINT(21.0920 55.7020)')),
  ('Kuršių nerija', 'UNESCO saugoma kopa tarp jūros ir marių', ST_GeogFromText('POINT(21.0500 55.4500)')),
  ('Nida', 'Žvejų miestelis Kuršių nerijoje', ST_GeogFromText('POINT(21.0080 55.3030)')),
  ('Parnidžio kopa', 'Viena aukščiausių kopų Europoje', ST_GeogFromText('POINT(21.0350 55.2890)')),
  ('Klaipėdos pilis', 'Buvusi Prūsų pilis prie uosto', ST_GeogFromText('POINT(21.1360 55.7095)'))
ON CONFLICT DO NOTHING;

-- Gamtos objektai ir nacionaliniai parkai
INSERT INTO places (name, description, location) VALUES
  ('Trakų pilis', 'XIV a. pilis saloje Galvės ežere', ST_GeogFromText('POINT(24.9345 54.6525)')),
  ('Trakai', 'Istorinė sostinė su garsiu pilies kompleksu', ST_GeogFromText('POINT(24.9355 54.6385)')),
  ('Aukštaitijos nacionalinis parkas', 'Seniausias Lietuvos nacionalinis parkas', ST_GeogFromText('POINT(26.0500 55.4500)')),
  ('Dzūkijos nacionalinis parkas', 'Didžiausias nacionalinis parkas Lietuvoje', ST_GeogFromText('POINT(24.2500 54.0500)')),
  ('Kuršių nerijos nacionalinis parkas', 'UNESCO pasaulio paveldo objektas', ST_GeogFromText('POINT(21.0600 55.5000)')),
  ('Žemaitijos nacionalinis parkas', 'Parkas su Platelių ežeru', ST_GeogFromText('POINT(21.8500 56.0500)')),
  ('Plateliai', 'Miestelis Žemaitijoje prie ežero', ST_GeogFromText('POINT(21.8154 56.0420)')),
  ('Anykščių šilelis', 'A. Baranausko ir A. Vienuolio memorialinis muziejus', ST_GeogFromText('POINT(25.1050 55.5240)')),
  ('Punios kopos', 'Neolisinės gyvenvietės vieta', ST_GeogFromText('POINT(21.0620 55.4580)')),
  ('Ventės ragas', 'Pusiasalis Kuršių marių deltoje', ST_GeogFromText('POINT(21.1950 55.3430)'))
ON CONFLICT DO NOTHING;

-- Svarbūs religiniai objektai
INSERT INTO places (name, description, location) VALUES
  ('Kryžių kalnas', 'Piligrimų vieta su tūkstančiais kryžių', ST_GeogFromText('POINT(23.4160 56.0150)')),
  ('Pažaislio kamaldulių vienuolynas', 'Barokinis architektūros šedevras', ST_GeogFromText('POINT(23.9750 54.8590)')),
  ('Šiluvos bazilika', 'Garsus piligrimų kelionių centras', ST_GeogFromText('POINT(23.0465 55.4850)')),
  ('Šv. Petro ir Povilo bažnyčia', 'Įspūdinga barokinė bažnyčia Vilniuje', ST_GeogFromText('POINT(25.2970 54.6920)')),
  ('Šv. Onos bažnyčia', 'Gotikinė architektūros perlas Vilniuje', ST_GeogFromText('POINT(25.2970 54.6820)'))
ON CONFLICT DO NOTHING;

-- Kurortai ir poilsio vietos
INSERT INTO places (name, description, location) VALUES
  ('Palanga', 'Populiariausias Lietuvos pajūrio kurortas', ST_GeogFromText('POINT(21.0685 55.9170)')),
  ('Palangos tiltas', 'Istorinis tiltas į jūrą', ST_GeogFromText('POINT(21.0530 55.9210)')),
  ('Birštonas', 'Kurortas prie Nemuno kilpų', ST_GeogFromText('POINT(24.0310 54.6020)')),
  ('Druskininkai', 'Sveikatingumo kurortas', ST_GeogFromText('POINT(23.9750 54.0170)')),
  ('Neringa', 'Kuršių nerijos savivaldybė', ST_GeogFromText('POINT(21.0500 55.4500)'))
ON CONFLICT DO NOTHING;

-- Mažesni miestai ir miesteliai
INSERT INTO places (name, description, location) VALUES
  ('Alytus', 'Miestas pietų Lietuvoje', ST_GeogFromText('POINT(24.0460 54.3963)')),
  ('Marijampolė', 'Suvalkijos sostinė', ST_GeogFromText('POINT(23.3540 54.5595)')),
  ('Mažeikiai', 'Miestas šiaurės vakarų Lietuvoje', ST_GeogFromText('POINT(22.3415 56.3095)')),
  ('Utena', 'Aukštaitijos miestas', ST_GeogFromText('POINT(25.5985 55.4975)')),
  ('Kėdainiai', 'Senas miestas su įdomia istorija', ST_GeogFromText('POINT(23.9740 55.2850)')),
  ('Jonava', 'Pramoninis miestas prie Neries', ST_GeogFromText('POINT(24.2790 55.0730)')),
  ('Telšiai', 'Žemaitijos sostinė', ST_GeogFromText('POINT(22.2475 55.9815)')),
  ('Tauragė', 'Miestas vakarų Lietuvoje', ST_GeogFromText('POINT(22.2910 55.2510)')),
  ('Ukmergė', 'Miestas centrinėje Lietuvoje', ST_GeogFromText('POINT(24.7565 55.2475)')),
  ('Visaginas', 'Jauniausias Lietuvos miestas', ST_GeogFromText('POINT(26.4410 55.5940)'))
ON CONFLICT DO NOTHING;

-- Paminklai ir memorialai
INSERT INTO places (name, description, location) VALUES
  ('Tuskulėnų rimties parkas', 'Memorialinis kompleksas Vilniuje', ST_GeogFromText('POINT(25.3100 54.7040)')),
  ('Salaspilio memorialas', 'Netoli Rygos, bet svarbus Lietuvai', ST_GeogFromText('POINT(24.3550 56.8590)')),
  ('Rūdninkų giria', 'Partizanų veiklos vieta', ST_GeogFromText('POINT(25.1500 54.5000)')),
  ('Rainių miškas', 'Memorialinis kompleksas', ST_GeogFromText('POINT(23.4750 56.0120)'))
ON CONFLICT DO NOTHING;

-- Sukuriame erdvinį indeksą geresniam veikimui
CREATE INDEX IF NOT EXISTS places_location_idx ON places USING GIST(location);

-- Statistika po duomenų įkėlimo
SELECT COUNT(*) as total_places FROM places;
