create or replace function places.search(p_params jsonb) returns jsonb
language plpgsql as $$
declare
r jsonb;
l_pos geometry;
l_text text;
begin
  if p_params->>'pos' is null then
    return jsonb_build_object('error', 'parameter "pos" is mandatory');
  else
    l_pos = st_setsrid(st_makepoint((p_params->'pos'->>0)::float, (p_params->'pos'->>1)::float), 4326);
  end if;
  l_text = '%' || lower(p_params->>'text') || '%';
  insert into places.log(t, l) values ('SEARCH: ' || p_params::text, now());
  if p_params->>'mapType' = 'places' then
  select json_build_object(
      'type', 'FeatureCollection',
      'features', coalesce(json_agg(
        json_build_object(
          'type', 'Feature',
          'id', id,
          'properties', attr || jsonb_build_object('TYPE', type) || jsonb_build_object('DIST', st_distance(st_transform(geom, 3346), st_transform(l_pos,3346))),
          'geometry', ST_AsGeoJSON(geom)::json
        )
      ), '[]'::json)
    ) AS geojson
    into r
    from (
      select *
        from places.poi
       where name_tsvector @@ plainto_tsquery('lt', p_params->>'text')
          or addr_tsvector @@ plainto_tsquery('lt', p_params->>'text')
          -- galima keisti panasumo lygi, pagal nutylejima 0.3. SELECT set_limit(0.5);
          or name_text % (p_params->>'text')
          or addr_text % (p_params->>'text')
       order by
         case
           when name_tsvector @@ plainto_tsquery('lt', p_params->>'text') then 0
           when addr_tsvector @@ plainto_tsquery('lt', p_params->>'text') then 1
           when name_text % (p_params->>'text') then 2
           when addr_text % (p_params->>'text') then 3
           else 4
         end,
         st_distance(geom, l_pos)
      limit 10
    ) x;
  else
  select json_build_object(
      'type', 'FeatureCollection',
      'features', coalesce(json_agg(
        json_build_object(
          'type', 'Feature',
          'id', id,
          'properties', attr || jsonb_build_object('TYPE', type) || jsonb_build_object('DIST', st_distance(st_transform(geom, 3346), st_transform(l_pos,3346))),
          'geometry', ST_AsGeoJSON(geom)::json
        )
      ), '[]'::json)
    ) AS geojson
    into r
    from (
      select *
        from public.search_map
       where name_tsvector @@ plainto_tsquery('lt', p_params->>'text')
          or addr_tsvector @@ plainto_tsquery('lt', p_params->>'text')
          -- galima keisti panasumo lygi, pagal nutylejima 0.3. SELECT set_limit(0.5);
          or name % (p_params->>'text')
          or address % (p_params->>'text')
       order by
         case
           when name_tsvector @@ plainto_tsquery('lt', p_params->>'text') then 0
           when addr_tsvector @@ plainto_tsquery('lt', p_params->>'text') then 1
           when name % (p_params->>'text') then 2
           when address % (p_params->>'text') then 3
           else 4
         end,
         st_distance(geom, l_pos)
      limit 10
    ) x;
  end if;

  return r;
exception when others then
  return jsonb_build_object('error', sqlerrm);
end$$;