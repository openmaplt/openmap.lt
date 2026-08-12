-- places.ai_search(p_params jsonb)
--
-- POI paieška, kai paieškos kriterijų suformuoja LLM (Gemini, per
-- src/app/api/ai-search/route.ts) — LLM NIEKADA neduoda SQL, tik
-- struktūrizuotą JSON (žr. src/lib/aiSearchSchema.ts), kurį TS pusė
-- patikrina prieš whitelist'ą (src/config/ai-search-catalog.ts) PRIEŠ
-- kviesdama šią funkciją. Ši funkcija NĖRA antra apsaugos linija nuo
-- laisvo key/value tagFilters — nekviesti jos tiesiai iš neapsaugoto kelio.
--
-- p_params forma:
-- {
--   "groups": [
--     {"types": "qr", "tagFilters": [{"key":"shop","value":"bakery"}], "keywords": ["kepykla","duona"]}
--   ],
--   "bbox": [west, south, east, north],
--   "pos": [lng, lat]
-- }
--
-- Grupės sujungiamos OR. Grupės viduje: (types ARBA tagFilters) IR
-- (keywords, jei nurodyta). Grupė be types/tagFilters remiasi vien
-- keywords (pvz. "itališkas maistas" neturi atr. požymio duomenyse).
--
-- Visos laisvo teksto reikšmės į dinaminį SQL įterpiamos TIK per
-- format(...,%L) (quote_literal), niekada tiesiogine konkatenacija.
create or replace function places.ai_search(p_params jsonb) returns jsonb as $$
declare
  r jsonb;
  l_bbox_filter text;
  l_pos_point text;
  l_groups_where text;
  l_group jsonb;
  l_group_types text;
  l_group_struct text;
  l_group_keywords text;
  l_tag jsonb;
  l_kw text;
  l_query text;
  l_limit constant int := 25;
begin
  l_bbox_filter := format(
    'geom && ST_SetSRID(''BOX(%s %s,%s %s)''::box2d, 4326)',
    ((p_params->'bbox')->>0)::double precision,
    ((p_params->'bbox')->>3)::double precision,
    ((p_params->'bbox')->>2)::double precision,
    ((p_params->'bbox')->>1)::double precision
  );

  l_pos_point := format(
    'ST_SetSRID(ST_MakePoint(%s, %s), 4326)',
    ((p_params->'pos')->>0)::double precision,
    ((p_params->'pos')->>1)::double precision
  );

  l_groups_where := 'false';

  for l_group in select * from jsonb_array_elements(coalesce(p_params->'groups', '[]'::jsonb))
  loop
    l_group_types := coalesce(l_group->>'types', '');

    if l_group_types = '' and jsonb_array_length(coalesce(l_group->'tagFilters', '[]'::jsonb)) = 0 then
      -- Nėra struktūrinio filtro šiai grupei — sprendžia vien keywords.
      l_group_struct := 'true';
    else
      l_group_struct := '(' || places.get_where_condition(l_group_types) || ')';

      for l_tag in select * from jsonb_array_elements(coalesce(l_group->'tagFilters', '[]'::jsonb))
      loop
        l_group_struct := l_group_struct || format(' or (attr->>%L = %L)', l_tag->>'key', l_tag->>'value');
      end loop;
    end if;

    if jsonb_array_length(coalesce(l_group->'keywords', '[]'::jsonb)) = 0 then
      l_group_keywords := 'true';
    else
      l_group_keywords := 'false';
      for l_kw in select * from jsonb_array_elements_text(l_group->'keywords')
      loop
        l_group_keywords := l_group_keywords || format(
          ' or name_tsvector @@ plainto_tsquery(''lt'', %L)'
          || ' or addr_tsvector @@ plainto_tsquery(''lt'', %L)'
          || ' or name_text %% %L'
          || ' or coalesce(attr->>''description'', '''') ilike %L',
          l_kw, l_kw, l_kw, '%' || l_kw || '%'
        );
      end loop;
    end if;

    l_groups_where := l_groups_where || format(' or (%s and (%s))', l_group_struct, l_group_keywords);
  end loop;

  l_query := format(
    'select json_build_object(
       ''type'', ''FeatureCollection'',
       ''features'', coalesce(json_agg(json_build_object(
         ''type'', ''Feature'',
         ''id'', id,
         ''properties'', attr || jsonb_build_object(''TYPE'', type, ''DIST'', dist),
         ''geometry'', ST_AsGeoJSON(geom)::json
       )), ''[]''::json)
     )
     from (
       select id, type, attr, geom,
              ST_Distance(ST_Transform(geom, 3346), ST_Transform(%s, 3346)) as dist
       from places.poi
       where %s and (%s)
       order by dist
       limit %s
     ) matched',
    l_pos_point, l_bbox_filter, l_groups_where, l_limit
  );

  execute l_query into r;

  insert into places.log(t, l) values ('AI_SEARCH: ' || p_params::text, now());

  return r;
exception when others then
  return jsonb_build_object('error', sqlerrm);
end
$$ language plpgsql;

comment on function places.ai_search(jsonb) is 'AI paieška: p_params.groups suformuoja LLM (per src/app/api/ai-search/route.ts) kaip struktūrizuotą JSON (types/tagFilters/keywords), NIEKADA kaip SQL. Grupės OR''inamos tarpusavyje; grupės viduje (types ARBA tagFilters) IR (keywords, jei yra). Naudoja places.get_where_condition (nepakeistą) tipams, attr->>key = value tagFilters (patikrintus prieš TS whitelist''ą, žr. src/config/ai-search-catalog.ts), tsvector/trigram/ILIKE paieškai vardo/aprašymo tekste, ir atstumą nuo pos (SRID 3346) rikiavimui. Grąžina iki 25 GeoJSON Feature. Logguoja į places.log su prefiksu ''AI_SEARCH: ''.';
