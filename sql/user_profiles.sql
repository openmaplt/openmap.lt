do $$ begin
  create type openmap.profile_base_status as enum ('none', 'requested', 'approved');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type openmap.profile_moderation_status as enum ('visible', 'hidden', 'review_requested');
exception when duplicate_object then null;
end $$;

create table if not exists openmap.user_profiles (
  id uuid primary key default gen_random_uuid()
 ,user_id int not null references openmap.users(id) on delete cascade
 ,slug text not null unique
 ,name text not null
 ,base_status openmap.profile_base_status not null default 'none'
 ,base_approved_at timestamptz
 ,moderation_status openmap.profile_moderation_status not null default 'visible'
 ,moderation_note text
 ,style jsonb not null
 ,created_at timestamptz not null default now()
 ,updated_at timestamptz not null default now()
 ,check (char_length(name) between 1 and 80)
 ,check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 40)
 ,constraint user_profiles_approved_has_date check (base_status <> 'approved' or base_approved_at is not null)
 -- Paslėptas profilis negali likti bazinis (rodomas visiems perjungiklyje).
 ,constraint user_profiles_hidden_not_base check (moderation_status = 'visible' or base_status = 'none')
);

comment on table openmap.user_profiles is 'Naudotojų sukurti žemėlapių profiliai (stilius redaguojamas Maputnik redaktoriumi); atidaromi per /m/<slug>. Numatytai visi vieši, žinant adresą';
comment on column openmap.user_profiles.slug is 'Viešas, nekeičiamas profilio identifikatorius URL''e (/m/<slug>); vidinis raktas yra id';
comment on column openmap.user_profiles.base_status is 'none -> requested (savininkas siūlo) -> approved (admin patvirtino, rodomas visiems profilių perjungiklyje); galimas tik kai moderation_status = visible';
comment on column openmap.user_profiles.base_approved_at is 'Kada admin paskutinį kartą patvirtino profilį kaip bazinį (arba patvirtino jo pakeitimus); NULL kol base_status nėra approved. Jei updated_at vėlesnis, profilis pakeistas jau po patvirtinimo';
comment on column openmap.user_profiles.moderation_status is 'visible: atidaromas visų; hidden: admin paslėpė (žr. moderation_note), mato tik autorius ir moderatoriai; review_requested: autorius pataisė ir prašo peržiūros, vis dar paslėptas';
comment on column openmap.user_profiles.moderation_note is 'Admin komentaras autoriui, kodėl profilis paslėptas; NULL kol visible';
comment on column openmap.user_profiles.style is 'MapLibre stiliaus JSON (version 8); serverio pusėje validuojamas prieš įrašant, ribojamas dydis';
comment on column openmap.user_profiles.updated_at is 'Paskutinio turinio pakeitimo (stiliaus arba pavadinimo) laikas: stiliaus ETag / cache-bust ir bazinių profilių peržiūros (palyginimas su base_approved_at). Moderavimas ir bazinio statuso keitimas jo nekeičia';

create index if not exists user_profiles_user_id_idx on openmap.user_profiles(user_id);
create index if not exists user_profiles_approved_idx on openmap.user_profiles(base_status) where base_status = 'approved';
