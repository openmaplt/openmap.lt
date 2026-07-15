create or replace function places.list(p_params jsonb) returns jsonb
language plpgsql as $$
declare
r jsonb;
l_where text;
l_bbox_filter text;
l_query text;
begin
  l_bbox_filter := format(
    'geom && ST_SetSRID(''BOX(%s %s,%s %s)''::box2d, 4326)',
    ((p_params->'bbox')->>0)::double precision,
    ((p_params->'bbox')->>3)::double precision,
    ((p_params->'bbox')->>2)::double precision,
    ((p_params->'bbox')->>1)::double precision
  );
  l_where = '(' || places.get_where_condition(p_params->>'types') || ')';

  l_query := '
    SELECT json_build_object(
      ''type'', ''FeatureCollection'',
      ''features'', coalesce(json_agg(
        json_build_object(
          ''type'', ''Feature'',
          ''id'', id,
          ''properties'', attr || jsonb_build_object(''TYPE'', type),
          ''geometry'', ST_AsGeoJSON(geom)::json
        )
      ), ''[]''::json)
    ) AS geojson
    FROM places.poi
    WHERE ' || l_bbox_filter || ' AND ' || l_where;

  EXECUTE l_query INTO r;

  return r;
exception when others then
  return jsonb_build_object('error', sqlerrm);
end$$;