create table if not exists openmap.users (
  id serial primary key
 ,username text
 ,name text
 ,email text
 ,avatar_url text
 ,created_at timestamptz not null default now()
);

comment on column openmap.users.username is 'Provaiderio "handle" (pvz. OSM display_name)';
comment on column openmap.users.name is 'Pilnas vardas, jei provaideris jį pateikia (pvz. Google name)';
comment on column openmap.users.email is 'El. paštas rodymui — NIEKADA nenaudojamas automatiniam paskyrų susiejimui tarp provaiderių';
comment on column openmap.users.avatar_url is 'Nuoroda į vartotojo avataro paveikslėlį (provaiderio pateikta URL, ne saugomas failas)';

create table if not exists openmap.user_auths (
  id serial primary key
 ,user_id int not null references openmap.users(id) on delete cascade
 ,provider text not null check (provider in ('osm', 'google'))
 ,provider_user_id text not null
 ,email text
 ,created_at timestamptz not null default now()
 ,unique (provider, provider_user_id)
);

comment on column openmap.user_auths.provider is 'OAuth provaideris: osm arba google';
comment on column openmap.user_auths.provider_user_id is 'Provaiderio vartotojo ID (OSM user id / Google "sub")';
comment on column openmap.user_auths.email is 'El. paštas, kaip grąžina provaideris šiam konkrečiam auth įrašui';

create index if not exists user_auths_user_id_idx on openmap.user_auths(user_id);

create table if not exists openmap.sessions (
  id serial primary key
 ,token_hash char(64) not null unique
 ,user_id int not null references openmap.users(id) on delete cascade
 ,created_at timestamptz not null default now()
 ,expires_at timestamptz not null
);

comment on column openmap.sessions.token_hash is 'SHA-256 (hex) maiša sesijos tokeno, kuris laikomas httpOnly cookie — pats tokenas DB niekada nesaugomas';

create index if not exists sessions_user_id_idx on openmap.sessions(user_id);
create index if not exists sessions_expires_at_idx on openmap.sessions(expires_at);
