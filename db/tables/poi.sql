create table places.poi (
  id serial primary key
 ,osm_type char
 ,osm_id bigint
 ,attr jsonb
 ,geom geometry(point,3857)
);

comment on column places.poi.id is 'Primary key';
comment on column places.poi.osm_type is 'Object type: n - node, w - way, r - relation';
comment on column places.poi.osm_id is 'Open street map object id';
comment on column places.poi.attr is 'Array of ordered place attributes, formatted for displaying';

create index poi_gix on places.poi using gist(geom);
