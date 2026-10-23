create table if not exists openmap.user_settings (
  user_id int primary key references openmap.users(id) on delete cascade
 ,settings jsonb not null default '{}'
 ,updated_at timestamptz not null default now()
);

comment on table openmap.user_settings is 'Naudotojo asmeniniai nustatymai (/paskyra/...), viena eilutė naudotojui; eilutės nebuvimas reiškia numatytuosius nustatymus';
comment on column openmap.user_settings.settings is 'JSON objektas su pavienių nustatymų raktais (pvz. {"hiddenProfileIds": ["craftbeer"]}); raktų reikšmės validuojamos serverio pusėje prieš įrašant, nežinomi raktai ignoruojami skaitant';
