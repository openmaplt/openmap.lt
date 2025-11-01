create or replace function places.list(p_params jsonb) returns jsonb
language plpgsql as $$
declare
r jsonb;
begin
  select jsonb_agg(
           jsonb_build_object(
             'id', id,
             'attr', attr,
             'geom', jsonb_build_array(st_x(geom), st_y(geom))
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
