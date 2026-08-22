create table if not exists openmap.user_collections (
  user_id int primary key references openmap.users(id) on delete cascade
 ,type_codes text[] not null default '{}'
 ,updated_at timestamptz not null default now()
);

comment on table openmap.user_collections is 'Naudotojo pasirinkti "places" profilio POI tipų kodai, kuriuos jis nori kolekcionuoti (/paskyra/kolekcionavimas)';
comment on column openmap.user_collections.type_codes is 'Vieno simbolio POI tipų kodų masyvas, pvz. {b,e,c} — tas pats kodų rinkinys, kurį naudoja "places" profilio tipų filtras; validuojama serverio pusėje prieš įrašant';
comment on column openmap.user_collections.updated_at is 'Kada naudotojas paskutinį kartą paspaudė „Išsaugoti"';
