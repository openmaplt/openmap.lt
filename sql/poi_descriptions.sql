create table if not exists openmap.poi_descriptions (
  object_ref  text not null primary key
 ,body        text not null
 ,editor_id   int not null references openmap.users(id) on delete restrict
 ,updated_at  timestamptz not null default now()
);

comment on table openmap.poi_descriptions is 'Papildomas "places" profilio objekto aprašymas (markdown), rodomas visiems žemėlapio naudotojams; redaguoti gali tik "places.description.edit" teisę turintys naudotojai. Viena bendra eilutė per objektą (ne per naudotoją) — naujausias redagavimas iškart pakeičia visiems matomą tekstą.';
comment on column openmap.poi_descriptions.object_ref is 'POI objekto id places.poi lentelėje (tekstu) — tas pats formatas, kurį naudoja openmap.poi_comments.object_ref, openmap.poi_ratings.object_ref ir openmap.poi_collection_status.object_ref';
comment on column openmap.poi_descriptions.body is 'Aprašymo tekstas markdown formatu (paragrafai, bold/italic, nuorodos)';
comment on column openmap.poi_descriptions.editor_id is 'Naudotojas, paskutinis redagavęs aprašymą — tik atsakomybei/auditui, ne nuosavybei (bet kuris teisę turintis naudotojas gali perrašyti)';
