create table if not exists openmap.user_collections (
  user_id int primary key references openmap.users(id) on delete cascade
 ,type_codes text[] not null default '{}'
 ,updated_at timestamptz not null default now()
);

comment on table openmap.user_collections is 'Naudotojo pasirinkti "places" profilio POI tipų kodai, kuriuos jis nori kolekcionuoti (/paskyra/kolekcionavimas)';
comment on column openmap.user_collections.type_codes is 'Vieno simbolio POI tipų kodų masyvas, pvz. {b,e,c} — tas pats kodų rinkinys, kurį naudoja "places" profilio tipų filtras; validuojama serverio pusėje prieš įrašant';
comment on column openmap.user_collections.updated_at is 'Kada naudotojas paskutinį kartą paspaudė „Išsaugoti"';

do $$ begin
  create type openmap.poi_collection_status_value as enum ('visited', 'not_interesting');
exception when duplicate_object then null;
end $$;

create table if not exists openmap.poi_collection_status (
  user_id int not null references openmap.users(id) on delete cascade
 ,object_ref text not null
 ,status openmap.poi_collection_status_value not null
 ,updated_at timestamptz not null default now()
 ,primary key (user_id, object_ref)
);

comment on table openmap.poi_collection_status is 'Naudotojo pažymėta konkretaus "places" profilio POI būsena kolekcionavime — ar objektas aplankytas, ar naudotojui neįdomus; eilutės nebuvimas reiškia "neaplankytas"';
comment on column openmap.poi_collection_status.object_ref is 'POI objekto išorinis id — tas pats formatas, kurį naudoja openmap.poi_comments.object_ref';
