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
  select json_build_object(
      'type', 'FeatureCollection',
      'features', coalesce(json_agg(
        json_build_object(
          'type', 'Feature',
          'id', id,
          'properties', attr || jsonb_build_object('TYPE', type) || jsonb_build_object('DIST', st_distance(geom, l_pos)),
          'geometry', ST_AsGeoJSON(geom)::json
        )
      ), '[]'::json)
    ) AS geojson
    into r
    from (
      select *
        from places.poi
       where (l_text is null or lower(attr->>'name') like l_text)
       order by st_distance(geom, l_pos)
      limit 10
    ) x;

  return r;
exception when others then
  return jsonb_build_object('error', sqlerrm);
end$$;
