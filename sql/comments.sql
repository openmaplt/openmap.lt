do $$ begin
  create type openmap.comment_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

create table if not exists openmap.poi_comments (
  id serial primary key
 ,user_id int not null references openmap.users(id) on delete cascade
 ,map_profile_id text not null
 ,object_ref text not null
 ,poi_name text
 ,body text not null
 ,status openmap.comment_status not null default 'pending'
 ,created_at timestamptz not null default now()
 ,moderated_at timestamptz
 ,moderated_by int references openmap.users(id) on delete set null
 ,check (char_length(body) between 1 and 2000)
);

do $$ begin
  alter table openmap.poi_comments
    add constraint poi_comments_object_ref_length check (char_length(object_ref) between 1 and 200);
exception when duplicate_object then null;
end $$;

comment on column openmap.poi_comments.map_profile_id is 'Žemėlapio profilio id (src/config/map-profiles.ts MAP_PROFILES[].id), pvz. "places", "craftbeer", "protected" — kartu su object_ref sudaro unikalią komentarų giją';
comment on column openmap.poi_comments.object_ref is 'POI objekto išorinis id profilio ribose — tas pats, kurį naudoja MapProvider.selectedPoiId';
comment on column openmap.poi_comments.poi_name is 'Objekto pavadinimo nuoroda komentavimo momentu — tik rodymui (moderavimo eilėje, "Mano komentarai"), jei objektas vėliau pervadintas/pašalintas';
comment on column openmap.poi_comments.body is 'Komentaro tekstas, tik tekstas (nuotraukos numatytos vėlesnei fazei)';
comment on column openmap.poi_comments.status is 'pending: laukia moderavimo, viešai nerodomas; approved: rodomas viešai; rejected: moderatorius atmetė, autorius mato, viešai nerodomas';
comment on column openmap.poi_comments.moderated_at is 'Kada patvirtinta/atmesta; NULL kol pending';
comment on column openmap.poi_comments.moderated_by is 'Kuris naudotojas patvirtino/atmetė';

create index if not exists poi_comments_thread_idx on openmap.poi_comments(map_profile_id, object_ref, status, created_at);
create index if not exists poi_comments_user_id_idx on openmap.poi_comments(user_id);
create index if not exists poi_comments_pending_idx on openmap.poi_comments(status, created_at) where status = 'pending';


do $$ begin
  alter table openmap.poi_comments add column rejection_reason text;
exception when duplicate_column then null;
end $$;

do $$ begin
  alter table openmap.poi_comments
    add constraint poi_comments_rejection_reason_length
    check (rejection_reason is null or char_length(rejection_reason) <= 500);
exception when duplicate_object then null;
end $$;

comment on column openmap.poi_comments.rejection_reason is 'Neprivaloma moderatoriaus nurodyta atmetimo priežastis; NULL jei nenurodyta arba komentaras nebuvo atmestas';
