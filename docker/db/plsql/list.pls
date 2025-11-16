create or replace function places.list(p_params jsonb) returns jsonb
language plpgsql as $$
declare
r jsonb;
l_where text;
l_bbox_filter text;
l_query text;
begin
  --insert into places.log(t, l) values ('Kvieciam su parametru: ' || p_params::text, now());
  l_bbox_filter = 'geom && ST_SetSRID(''BOX(' ||
    ((p_params->'bbox')->>0)::text || ' ' || ((p_params->'bbox')->>3)::text || ',' ||
    ((p_params->'bbox')->>2)::text || ' ' || ((p_params->'bbox')->>1)::text ||
    ')''::box2d, 4326)';
  l_where = '(' || places.get_where_condition(p_params->>'types') || ')';

  l_query := '
    SELECT json_build_object(
      ''type'', ''FeatureCollection'',
      ''features'', json_agg(
        json_build_object(
          ''type'', ''Feature'',
          ''id'', id,
          ''properties'', attr || jsonb_build_object(''TYPE'', type),
          ''geometry'', ST_AsGeoJSON(geom)::json
        )
      )
    ) AS geojson
    FROM places.poi
    WHERE ' || l_bbox_filter || ' AND ' || l_where;

  raise notice '%', l_query;

  EXECUTE l_query INTO r;

  if r is null then
    return '[]';
  else
    return r;
  end if;
exception when others then
  return jsonb_build_object('error', sqlerrm);
end$$;
