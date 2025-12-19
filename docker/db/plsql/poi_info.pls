create or replace function places.poi_info(p_params jsonb) returns jsonb
language plpgsql as $$
declare
r jsonb;
begin
  SELECT
    json_build_object(
        'extent', ARRAY[
            ST_XMin(expanded_box),
            ST_YMin(expanded_box),
            ST_XMax(expanded_box),
            ST_YMax(expanded_box)
        ],
        'filter', 'a'
    ) AS json
  INTO r
  FROM (
    SELECT st_transform(ST_Expand(st_transform(geom, 3346), 150), 4326) AS expanded_box
      FROM places.poi
     WHERE id = (p_params->>'id')::int
     LIMIT 1
  ) AS subquery;

  if r is null then
    return '{}';
  else
    return r;
  end if;
exception when others then
  return jsonb_build_object('error', sqlerrm);
end$$;
