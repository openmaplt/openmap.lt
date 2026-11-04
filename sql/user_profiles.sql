do $$ begin
  create type openmap.profile_visibility as enum ('private', 'link', 'public');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type openmap.profile_base_status as enum ('none', 'requested', 'approved');
exception when duplicate_object then null;
end $$;

create table if not exists openmap.user_profiles (
  id uuid primary key default gen_random_uuid()
 ,user_id int not null references openmap.users(id) on delete cascade
 ,slug text not null unique
 ,name text not null
 ,visibility openmap.profile_visibility not null default 'private'
 ,base_status openmap.profile_base_status not null default 'none'
 ,share_key text
 ,expires_at timestamptz
 ,style jsonb not null
 ,created_at timestamptz not null default now()
 ,updated_at timestamptz not null default now()
 ,check (char_length(name) between 1 and 80)
 ,check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 40)
 ,check (base_status = 'none' or visibility = 'public')
 ,check (visibility <> 'link' or share_key is not null)
);

comment on table openmap.user_profiles is 'Naudotojų sukurti žemėlapių profiliai (stilius redaguojamas Maputnik redaktoriumi); atidaromi per /m/<slug>';
comment on column openmap.user_profiles.slug is 'Viešas, nekeičiamas profilio identifikatorius URL''e (/m/<slug>); vidinis raktas yra id';
comment on column openmap.user_profiles.visibility is 'private: tik savininkas; link: tik su share_key (?k=); public: bet kas, žinantis slug';
comment on column openmap.user_profiles.base_status is 'none -> requested (savininkas siūlo) -> approved (admin patvirtino, rodomas visiems profilių perjungiklyje); galimas tik kai visibility = public';
comment on column openmap.user_profiles.share_key is 'Slaptas atsitiktinis raktas link režimui (?k=); pakeitus senos nuorodos nustoja veikti';
comment on column openmap.user_profiles.expires_at is 'Kada nustoja galioti link nuoroda; NULL = galioja neribotai. Taikoma tik visibility = link';
comment on column openmap.user_profiles.style is 'MapLibre stiliaus JSON (version 8); serverio pusėje validuojamas prieš įrašant (src/lib/profileStyle.ts), ribojamas dydis';

create index if not exists user_profiles_user_id_idx on openmap.user_profiles(user_id);
create index if not exists user_profiles_approved_idx on openmap.user_profiles(base_status) where base_status = 'approved';
