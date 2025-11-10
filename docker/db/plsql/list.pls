create or replace function places.list(p_params jsonb) returns jsonb
language plpgsql as $$
declare
r jsonb;
begin
  select jsonb_agg(
           jsonb_build_object(
             'id', id,
             'type', 'A',
             'attr', attr,
             'geom', jsonb_build_array(
               st_x(st_transform(geom, 4326)),
               st_y(st_transform(geom, 4326))
             )
           )
         )
    into r
    from places.poi;

  if r is null then
    return '[]';
  else
    return r;
  end if;
exception when others then
  return jsonb_build_object('error', sqlerrm);
end$$;
