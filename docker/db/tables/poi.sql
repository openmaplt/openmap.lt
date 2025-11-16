drop table if exists places.poi;
create table places.poi (
  id serial primary key
 ,obj_type char
 ,osm_id bigint
 ,attr jsonb
 ,x char
 ,uid int
 ,type character(3)
 ,historic text
 ,site_type text
 ,ref_lt_kpd text
 ,geom geometry(point,4326)
);

comment on column places.poi.id is 'Primary key';
comment on column places.poi.obj_type is 'Object type: n - node, w - way, r - relation';
comment on column places.poi.osm_id is 'Open street map object id';
comment on column places.poi.attr is 'Array of ordered place attributes, formatted for displaying';
comment on column places.poi.x is 'Column is used during POI update, it helps find POIs which no longer exist in OSM';

create index poi_gix on places.poi using gist(geom);
