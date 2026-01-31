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
      'filter', case
          when type = 'HIL' then 'b'
          when type = 'TUM' then 'e'
          when type = 'MAN' then 'f'
          when type = 'HER' then 'c'
          when type = 'HIS' then 'a'
          when type = 'INF' then 't'
          when type = 'ATT' then 'h'
          when type = 'VIE' then 'W'
          when type = 'SPR' then '3'
          when type = 'TRE' then '3'
          when type = 'STO' then '3'
          when type = 'HIK' then '1'
          when type = 'TOW' then 'g'
          when type = 'CAM' then 'l'
          when type = 'HOT' then 's'
          when type = 'FUE' then 'n'
          when type = 'SPE' then 'w'
          when type = 'WAS' then 'T'
          when type = 'CAR' then 'G'
          when type = 'CAF' then 'o'
          when type = 'FAS' then 'p'
          when type = 'RES' then 'q'
          when type = 'PUB' then 'r'
          when type = 'THE' then 'u'
          when type = 'CIN' then 'v'
          when type = 'ART' then 'x'
          when type = 'MUS' then 'i'
          when type = 'LIB' then 'y'
          when type = 'HOS' then 'z'
          when type = 'CLI' then 'A'
          when type = 'PIC' then 'k'
          when type = 'PIF' then 'j'
          when type = 'DOC' then 'C'
          when type = 'PHA' then 'D'
          when type = 'SUP' then 'E'
          when type = 'CON' then 'F'
          when type = 'CHU' then 'J'
          when type = 'LUT' then 'K'
          when type = 'ORT' then 'L'
          when type = 'MON' then 'X'
          when type = 'BAN' then 'U'
          when type = 'ORE' then '.'
          when type = 'MNS' then 'X'
          when type = 'GOV' then 'N'
          when type = 'OSH' then '.'
          when type = 'DIY' then '.'
          when type = 'ATM' then 'V'
          when type = 'COU' then 'D'
          when type = 'GUE' then '.'
          when type = 'UNI' then '.'
          when type = 'POS' then '.'
          else 'a'
        end,
      'properties', properties,
      'geometry', ST_AsGeoJSON(geom)::json
    ) AS json
  INTO r
  FROM (
    SELECT st_transform(ST_Expand(st_transform(geom, 3346), 150), 4326) AS expanded_box
          ,type
          ,attr AS properties
          ,geom
      FROM places.poi
     WHERE id = (p_params->>'id')::bigint
       and p_params->>'mapType' = 'p'
    union
    SELECT st_transform(ST_Expand(st_transform(way, 3346), 150), 4326) AS expanded_box
          ,null AS type
          ,'{"bim":"bam","tramp":"pampam"}'::jsonb AS properties
          ,geom
      FROM places.poi
     WHERE id = 34
       and p_params->>'mapType' = 'c'
    union
    SELECT st_transform(ST_Expand(st_transform(geom, 3346), 150), 4326) AS expanded_box
          ,null AS type
          ,jsonb_build_object('name','Pavadinimas') AS properties
          ,geom
      FROM places.poi
     WHERE id = 34
       and p_params->>'mapType' = 's'
  ) AS subquery;

  if r is null then
    return '{}';
  else
    return r;
  end if;
exception when others then
  return jsonb_build_object('error', sqlerrm);
end$$;
