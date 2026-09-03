alter table openmap.users add column if not exists role text check (role in ('admin', 'moderator'));

comment on column openmap.users.role is 'Bendra naudotojo rolė. admin: viskas leidžiama, jam openmap.user_permissions įrašų nereikia. moderator: pats savaime jokių teisių nesuteikia — konkrečios teisės priskiriamos individualiai per openmap.user_permissions, nes ne visi moderatoriai turi turėti tas pačias teises. NULL: paprastas naudotojas.';

create table if not exists openmap.permissions (
  id serial primary key
 ,slug text not null unique
 ,description text
);

comment on column openmap.permissions.slug is 'Teisės identifikatorius, tikrinamas kode (pvz. "comments.moderate")';
comment on column openmap.permissions.description is 'Žmogui skaitomas teisės aprašymas';

create table if not exists openmap.user_permissions (
  user_id int not null references openmap.users(id) on delete cascade
 ,permission_id int not null references openmap.permissions(id) on delete cascade
 ,created_at timestamptz not null default now()
 ,primary key (user_id, permission_id)
);

comment on column openmap.user_permissions.created_at is 'Kada teisė priskirta (šiuo etapu priskiriama tik rankiniu SQL insert, admin UI nėra)';

create index if not exists user_permissions_user_id_idx on openmap.user_permissions(user_id);

insert into openmap.permissions (slug, description) values
  ('comments.moderate', 'Gali matyti komentarų moderavimo eilę ir patvirtinti/atmesti komentarus'),
  ('photos.moderate', 'Gali matyti nuotraukų moderavimo eilę ir patvirtinti/atmesti nuotraukas'),
  ('places.description.edit', 'Gali redaguoti "places" profilio objektų papildomą aprašymą')
on conflict (slug) do nothing;

-- Pirmas administratorius / moderatorius priskiriami rankiniu SQL, pvz.:
-- update openmap.users set role = 'admin' where id = <users.id>;
-- update openmap.users set role = 'moderator' where id = <users.id>;
-- insert into openmap.user_permissions (user_id, permission_id)
-- select <users.id>, id from openmap.permissions where slug = 'comments.moderate';
