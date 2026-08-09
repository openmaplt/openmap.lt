do $$ begin
  create type openmap.photo_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type openmap.photo_license as enum ('CC-BY-4.0', 'CC0-1.0', 'CC-BY-SA-4.0', 'CC-BY-NC-4.0');
exception when duplicate_object then null;
end $$;

create table if not exists openmap.poi_photos (
  id serial primary key
 ,user_id int not null references openmap.users(id) on delete cascade
 ,map_profile_id text not null
 ,object_ref text not null
 ,poi_name text
 ,file_name text not null
 ,width int not null
 ,height int not null
 ,license openmap.photo_license not null default 'CC-BY-4.0'
 ,show_author boolean not null default true
 ,status openmap.photo_status not null default 'pending'
 ,created_at timestamptz not null default now()
 ,moderated_at timestamptz
 ,moderated_by int references openmap.users(id) on delete set null
 ,rejection_reason text
 ,check (char_length(object_ref) between 1 and 200)
 ,check (rejection_reason is null or char_length(rejection_reason) <= 500)
);

comment on column openmap.poi_photos.map_profile_id is 'Žemėlapio profilio id (src/config/map-profiles.ts MAP_PROFILES[].id), pvz. "places", "craftbeer", "protected" — kartu su object_ref sudaro unikalią nuotraukų giją, taip pat kaip openmap.poi_comments';
comment on column openmap.poi_photos.object_ref is 'POI objekto išorinis id profilio ribose — tas pats, kurį naudoja MapProvider.selectedPoiId';
comment on column openmap.poi_photos.poi_name is 'Objekto pavadinimo nuoroda įkėlimo momentu — tik rodymui, jei objektas vėliau pervadintas/pašalintas';
comment on column openmap.poi_photos.file_name is 'Failo vardas UPLOADS_DIR kataloge (UUID + .webp) — nuotrauka visada konvertuojama į webp įkėlimo metu';
comment on column openmap.poi_photos.width is 'Galutinis (po galimo sumažinimo iki max 2000px pločio) nuotraukos plotis pikseliais';
comment on column openmap.poi_photos.height is 'Galutinis nuotraukos aukštis pikseliais';
comment on column openmap.poi_photos.license is 'Naudotojo pasirinkta licencija įkėlimo metu';
comment on column openmap.poi_photos.show_author is 'Ar prie nuotraukos rodyti įkėlusio naudotojo vardą — pasirenkama kiekvienai nuotraukai atskirai įkėlimo metu, default true';
comment on column openmap.poi_photos.status is 'pending: laukia moderavimo, viešai nerodoma; approved: rodoma viešai; rejected: moderatorius atmetė, autorius mato „Mano nuotraukose", viešai nerodoma';
comment on column openmap.poi_photos.moderated_at is 'Kada patvirtinta/atmesta; NULL kol pending';
comment on column openmap.poi_photos.moderated_by is 'Kuris naudotojas patvirtino/atmetė';
comment on column openmap.poi_photos.rejection_reason is 'Neprivaloma moderatoriaus nurodyta atmetimo priežastis';

create index if not exists poi_photos_thread_idx on openmap.poi_photos(map_profile_id, object_ref, status, created_at);
create index if not exists poi_photos_user_id_idx on openmap.poi_photos(user_id);
create index if not exists poi_photos_pending_idx on openmap.poi_photos(status, created_at) where status = 'pending';
