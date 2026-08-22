-- places.list(p_params jsonb)
--
-- Grąžina "places" profilio POI GeoJSON FeatureCollection duotame bbox,
-- filtruotus pagal types (žr. places.get_where_condition, raidžių kodai iš
-- PLACES_FILTERS, src/config/places-filters.ts).
--
-- Neprivalomi usr_id + filter papildomai filtruoja pagal
-- openmap.poi_collection_status: filter='a' (aplankyta), filter='i'
-- (neįdomu), filter='n' (neaplankyta — eilutės tai kolekcijai nebuvimas,
-- žr. sql/collections.sql). Be jų (arba nežinomos filter reikšmės) elgesys
-- nepakitęs.
create or replace function places.list(p_params jsonb)
 returns jsonb
 language plpgsql
as $function$
declare
r jsonb;
l_where text;
l_bbox_filter text;
l_status_filter text := '';
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

  if p_params->>'usr_id' is not null and p_params->>'filter' is not null then
    case p_params->>'filter'
      when 'a' then
        l_status_filter := format(
          ' AND id::text IN (SELECT object_ref FROM openmap.poi_collection_status WHERE user_id = %s AND status = ''visited'')',
          (p_params->>'usr_id')::int
        );
      when 'i' then
        l_status_filter := format(
          ' AND id::text IN (SELECT object_ref FROM openmap.poi_collection_status WHERE user_id = %s AND status = ''not_interesting'')',
          (p_params->>'usr_id')::int
        );
      when 'n' then
        l_status_filter := format(
          ' AND id::text NOT IN (SELECT object_ref FROM openmap.poi_collection_status WHERE user_id = %s)',
          (p_params->>'usr_id')::int
        );
      else
        l_status_filter := '';
    end case;
  end if;

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
    WHERE ' || l_bbox_filter || ' AND ' || l_where || l_status_filter;

  EXECUTE l_query INTO r;

  return r;
exception when others then
  return jsonb_build_object('error', sqlerrm);
end$function$;
