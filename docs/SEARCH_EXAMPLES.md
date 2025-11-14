# Paieškos Pavyzdžiai / Search Examples

Šiame dokumente pateikiami natūralios lietuvių kalbos paieškos pavyzdžiai su laukiamais rezultatais.

## Baziniai pavyzdžiai

### 1. Paieška pagal POI tipą ir miestą

**Užklausa:** "baras vilniuje"

**LLM interpretacija:**
```json
{
  "poiType": "bar",
  "city": "Vilnius",
  "radius": 5000
}
```

**Rezultatas:** Grąžinami barai Vilniuje ir aplink centrą.

---

### 2. Paieška su orientyru

**Užklausa:** "baras vilniuje prie balto angelo"

**LLM interpretacija:**
```json
{
  "poiType": "bar",
  "landmark": "Baltas angelas",
  "city": "Vilnius",
  "radius": 5000
}
```

**Rezultatas:** Grąžinami barai arti paminklo "Baltas angelas" Vilniuje.

---

### 3. Paieška su "šalia"

**Užklausa:** "ligoninė šalia Žirmūnų tilto"

**LLM interpretacija:**
```json
{
  "poiType": "hospital",
  "landmark": "Žirmūnų tiltas",
  "radius": 5000
}
```

**Rezultatas:** Grąžinamos ligoninės šalia Žirmūnų tilto.

---

### 4. Paieška "netoli" su miestu

**Užklausa:** "automobilių plovykla netoli Mega Kaune"

**LLM interpretacija:**
```json
{
  "poiType": "car_wash",
  "landmark": "Mega",
  "city": "Kaunas",
  "radius": 5000
}
```

**Rezultatas:** Grąžinamos automobilių plovyklos arti Mega prekybos centro Kaune.

---

## Sudėtingesni pavyzdžiai

### 5. Paieška gamtinių objektų

**Užklausa:** "kemping'as netoli Trakų ežerų"

**LLM interpretacija:**
```json
{
  "poiType": "camp_site",
  "landmark": "Trakų ežerų",
  "city": "Trakai",
  "radius": 5000
}
```

**Rezultatas:** Grąžinami kempingai Trakų rajone.

---

### 6. Paieška su "artimiausias"

**Užklausa:** "koks yra artimiausias paštas nuo Vingio parko"

**LLM interpretacija:**
```json
{
  "poiType": "post_office",
  "landmark": "Vingio parkas",
  "radius": 5000
}
```

**Rezultatas:** Grąžinami pašto skyriai netoli Vingio parko, rūšiuojami pagal atstumą.

---

### 7. Paieška su konkrečiu pavadinimu

**Užklausa:** "parduotuvė Maxima centrinėje gatvėje"

**LLM interpretacija:**
```json
{
  "poiType": "shop",
  "keywords": ["Maxima", "centrinėje", "gatvėje"],
  "radius": 5000
}
```

**Rezultatas:** Grąžinamos Maxima parduotuvės su "centrinėje gatvėje" pavadinime.

---

## POI Tipų žodynas

### Maisto ir gėrimų vietos
- **baras, pub'as** → `bar`
- **restoranas, kavinė** → `restaurant`
- **greito maisto** → `fast_food`
- **kavinė** → `cafe`

### Sveikatos įstaigos
- **ligoninė** → `hospital`
- **klinika** → `clinic`
- **poliklinika** → `clinic`
- **vaistinė** → `pharmacy`

### Paslaugos
- **plovykla, automobilių plovykla** → `car_wash`
- **kirpykla** → `hairdresser`
- **bankas** → `bank`
- **paštas** → `post_office`
- **degalinė** → `fuel`

### Laisvalaikis
- **kemping'as, stovyklavietė** → `camp_site`
- **parkas** → `park`
- **muziejus** → `museum`
- **kinas** → `cinema`
- **teatras** → `theatre`

### Švietimas
- **mokykla** → `school`
- **darželis** → `kindergarten`
- **universitetas** → `university`

### Apsipirkimas
- **parduotuvė** → `shop`
- **prekybos centras** → `supermarket` arba `mall`
- **vaistinė** → `pharmacy`
- **knygynas** → `bookshop`

### Apgyvendinimas
- **viešbutis** → `hotel`
- **svečių namai** → `guest_house`

### Religija
- **bažnyčia** → `place_of_worship`

### Infrastruktūra
- **tiltas** → `bridge`
- **oro uostas** → `aerodrome`
- **autobusų stotis** → `bus_station`

## Tipinės klaidos ir sprendimai

### Klaida 1: Per daug raktažodžių

**Užklausa:** "aš noriu rasti labai gerą barą Vilniuje senamiestį šalia Rotušės aikštės"

**Problema:** Per daug nereikšmingų žodžių.

**Sprendimas:** LLM filtruoja nereikšmingus žodžius:
```json
{
  "poiType": "bar",
  "city": "Vilnius",
  "landmark": "Rotušės aikštė",
  "keywords": ["senamiestis"],
  "radius": 5000
}
```

---

### Klaida 2: Nežinomas POI tipas

**Užklausa:** "kur yra artimiausias kebab'as"

**Problema:** "kebab'as" nėra standartinis OSM POI tipas.

**Sprendimas:** LLM bando interpretuoti kaip:
```json
{
  "poiType": "fast_food",
  "keywords": ["kebab"],
  "radius": 5000
}
```

---

### Klaida 3: Nežinomas miestas

**Užklausa:** "parduotuvė Kudirkos Naumiestyje"

**Sprendimas:** Sistema nepažįsta miesto, naudoja default centrą (Vilnius) ir raktažodžius:
```json
{
  "poiType": "shop",
  "keywords": ["Kudirkos", "Naumiestyje"],
  "radius": 5000
}
```

---

## Geriausi praktikų patarimai

### 1. Būkite konkretūs
✅ **Gerai:** "vaistinė Kaune prie Kauno klinikų"  
❌ **Blogai:** "kažkokia vieta kur galima kažką pirkti"

### 2. Naudokite žinomus orientyrus
✅ **Gerai:** "baras prie Gedimino pilies"  
❌ **Blogai:** "baras kažkur senamiestyje"

### 3. Nurodykite miestą, jei svarbu
✅ **Gerai:** "restoranas Klaipėdoje"  
❌ **Blogai:** "restoranas" (naudos Vilniaus centrą)

### 4. Nenaudokite per daug detalių
✅ **Gerai:** "prekybos centras Šiauliuose"  
❌ **Blogai:** "aš ieškau prekybos centro Šiauliuose kur galėčiau nusipirkti drabužių ir maisto"

## Testavimo užklausos

Naudokite šias užklausas testavimui:

```bash
# Test 1: Paprastas baras
curl "http://localhost:3000/api/search?q=baras%20vilniuje"

# Test 2: Su orientyru
curl "http://localhost:3000/api/search?q=ligoninė%20šalia%20Žirmūnų%20tilto"

# Test 3: Kaunas
curl "http://localhost:3000/api/search?q=plovykla%20kaune"

# Test 4: Kemping'as
curl "http://localhost:3000/api/search?q=kempingas%20netoli%20Trakų"

# Test 5: Artimiausias
curl "http://localhost:3000/api/search?q=artimiausias%20paštas%20nuo%20Vingio%20parko"
```

## Tikėtini rezultatų pavyzdžiai

### Baras Vilniuje

```json
{
  "query": "baras vilniuje",
  "interpretation": {
    "poiType": "bar",
    "city": "Vilnius",
    "radius": 5000
  },
  "results": [
    {
      "id": 12345,
      "osm_id": 987654321,
      "obj_type": "n",
      "name": "Alaus namai",
      "type": "bar",
      "latitude": 54.687157,
      "longitude": 25.279652,
      "distance": 150
    }
  ],
  "count": 1
}
```

### Ligoninė šalia Žirmūnų tilto

```json
{
  "query": "ligoninė šalia Žirmūnų tilto",
  "interpretation": {
    "poiType": "hospital",
    "landmark": "Žirmūnų tiltas",
    "radius": 5000
  },
  "results": [
    {
      "id": 23456,
      "osm_id": 876543210,
      "obj_type": "w",
      "name": "Santaros klinikos",
      "type": "hospital",
      "latitude": 54.722436,
      "longitude": 25.290969,
      "distance": 850
    }
  ],
  "count": 1
}
```
