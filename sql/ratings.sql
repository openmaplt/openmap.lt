create table if not exists openmap.poi_ratings (
  user_id int not null references openmap.users(id) on delete cascade
 ,object_ref text not null
 ,rating smallint not null
 ,updated_at timestamptz not null default now()
 ,primary key (user_id, object_ref)
 ,check (rating between 1 and 5)
);

comment on table openmap.poi_ratings is 'Naudotojo pastatytas 1-5 žvaigždučių vertinimas "places" profilio objektui; naudotojas bet kada gali savo vertinimą pakeisti arba ištrinti (eilutės nebuvimas reiškia "nevertinta")';
comment on column openmap.poi_ratings.object_ref is 'POI objekto id places.poi lentelėje (tekstu) — tas pats formatas, kurį naudoja openmap.poi_comments.object_ref ir openmap.poi_collection_status.object_ref';
comment on column openmap.poi_ratings.rating is 'Vertinimas žvaigždutėmis, 1 (mažiausias) - 5 (didžiausias)';

create index if not exists poi_ratings_object_ref_idx on openmap.poi_ratings(object_ref);

-- Denormalizuotas vidurkis laikomas places.poi.rating (10-50, t.y. vidurkis
-- x10 su 1 skaitmeniu po kablelio; NULL - nė vieno vertinimo nėra), kad jo
-- nereikėtų perskaičiuoti kaskart rodant POI ar rikiuojant paieškos
-- rezultatus. Trigeris perskaičiuoja jį po kiekvieno įrašymo/pakeitimo/
-- ištrynimo šioje lentelėje, nepriklausomai nuo to, per kokį kelią įrašas
-- buvo padarytas.
create or replace function openmap.recalc_poi_rating() returns trigger as $$
declare
  l_object_ref text := coalesce(new.object_ref, old.object_ref);
  l_avg numeric;
begin
  select round(avg(rating) * 10) into l_avg
    from openmap.poi_ratings
   where object_ref = l_object_ref;

  update places.poi set rating = l_avg where id = l_object_ref::bigint;

  return null;
end;
$$ language plpgsql;

drop trigger if exists poi_ratings_recalc on openmap.poi_ratings;
create trigger poi_ratings_recalc
  after insert or update or delete on openmap.poi_ratings
  for each row execute function openmap.recalc_poi_rating();
