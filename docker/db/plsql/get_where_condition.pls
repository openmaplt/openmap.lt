create or replace function places.get_where_condition(p_filter text) returns text as $$
declare
l_filter text = '0=0';
i int;
begin
  for i in 1..length(p_filter) loop
    case substr(p_filter, i, 1)
      when 'a' then
        l_filter = l_filter ||
          ' or (historic is not null and ' ||
               'historic not in (''monument'', ''memorial'', ''wayside_cross'', ''wayside_shrine'', ''manor'') and' ||
               '(historic != ''archaeological_site'' or site_type not in (''fortification'', ''tumulus'')))';
      when 'b' then
        l_filter = l_filter ||
          ' or (historic = ''archaeological_site'' and site_type = ''fortification'')';
      when 'c' then
        l_filter = l_filter ||
          ' or (("ref_lt_kpd" is not null) and (coalesce(historic, ''@'') != ''archaeological_site'' or coalesce(site_type, ''@'') != ''fortification''))';
      else
        raise notice 'UNKNOWN filter: %', substr(p_filter, i, 1);
    end case;
  end loop;
/*
      case 'd': // paminklas
        $filter .= " or (historic in ('monument', 'memorial'))";
        break;
      case 'e': // pilkapiai
        $filter .= " or (historic = 'archaeological_site' and site_type = 'tumulus')";
        break;
      case 'f': // dvarai
        $filter .= " or (historic = 'manor')";
        break;
      case 'g':
        $filter .= " or (man_made in ('tower', 'communications_tower') and \"tower:type\" is not null and tourism in ('attraction', 'viewpoint', 'museum') and coalesce(access, 'yes') != 'no')";
        break;
      case 'h':
        $filter .= " or (tourism in ('attraction', 'theme_park', 'zoo', 'aquarium') and historic is null and \"attraction:type\" is null)";
        break;
      case 'W':
        $filter .= " or (tourism = 'viewpoint' and historic is null)";
        break;
      case 'i':
        $filter .= " or (tourism = 'museum')";
        break;
      case 'j':
        $filter .= " or ((tourism = 'picnic_site' or amenity = 'shelter') and fireplace = 'yes')";
        break;
      case 'k':
        $filter .= " or ((tourism = 'picnic_site' or amenity = 'shelter') and (fireplace is null or fireplace = 'no'))";
        break;
      case 'l':
        $filter .= " or (tourism in ('camp_site', 'caravan_site'))";
        break;
      case 'm':
        $filter .= " or (tourism in ('chalet', 'hostel', 'motel', 'guest_house'))";
        break;
      case 'n':
        $filter .= " or (amenity = 'fuel')";
        break;
      case 'o':
        $filter .= " or (amenity = 'cafe')";
        break;
      case 'p':
        $filter .= " or (amenity = 'fast_food')";
        break;
      case 'q':
        $filter .= " or (amenity = 'restaurant')";
        break;
      case 'r':
        $filter .= " or (amenity in ('pub', 'bar'))";
        break;
      case 's':
        $filter .= " or (tourism = 'hotel')";
        break;
      case 't':
        $filter .= " or (tourism = 'information')";
        break;
      case 'u':
        $filter .= " or (amenity = 'theatre')";
        break;
      case 'v':
        $filter .= " or (amenity = 'cinema')";
        break;
      case 'w':
        $filter .= " or (highway = 'speed_camera')";
        break;
      case 'x':
        $filter .= " or (amenity = 'arts_centre')";
        break;
      case 'y':
        $filter .= " or (amenity = 'library')";
        break;
      case 'z':
        $filter .= " or (amenity = 'hospital')";
        break;
      case 'A':
        $filter .= " or (amenity = 'clinic')";
        break;
      case 'B':
        $filter .= " or (amenity = 'dentist')";
        break;
      case 'C':
        $filter .= " or (amenity = 'doctors')";
        break;
      case 'D':
        $filter .= " or (amenity = 'pharmacy')";
        break;
      case 'E':
        $filter .= " or (shop in ('supermarket', 'mall'))";
        break;
      case 'F':
        $filter .= " or (shop = 'convenience')";
        break;
      case 'G':
        $filter .= " or (shop = 'car_repair')";
        break;
      case 'H':
        $filter .= " or (shop = 'kiosk')";
        break;
      case 'I':
        $filter .= " or (shop = 'doityourself')";
        break;
      case 'J':
        $filter .= " or (amenity = 'place_of_worship' and religion = 'christian' and denomination in ('catholic', 'roman_catholic'))";
        break;
      case 'K':
        $filter .= " or (amenity = 'place_of_worship' and religion = 'christian' and denomination in ('lutheran', 'evangelical', 'reformed'))";
        break;
      case 'L':
        $filter .= " or (amenity = 'place_of_worship' and religion = 'christian' and denomination in ('orthodox', 'old_believers'))";
        break;
      case 'M':
        $filter .= " or (amenity = 'place_of_worship' and (religion != 'christian' or coalesce(denomination, '@') not in ('catholic', 'roman_catholic', 'lutheran', 'evangelical', 'reformed', 'orthodox', 'old_believers')))";
        break;
      case 'N':
        $filter .= " or (office = 'government') or (amenity = 'townhall')";
        break;
      case 'O':
        $filter .= " or (amenity = 'courthouse')";
        break;
      case 'P':
        $filter .= " or (office in ('notary', 'lawyer'))";
        break;
      case 'Y':
        $filter .= " or (office = 'insurance')";
        break;
      case 'Q':
        $filter .= " or (office is not null and office not in ('government', 'notary', 'lawyer', 'insurance'))";
        break;
      case 'R':
        $filter .= " or (shop is not null and shop not in ('supermarket', 'mall', 'convenience', 'car_repair', 'kiosk', 'doityourself'))";
        break;
      case 'S':
        $filter .= " or (amenity = 'post_office')";
        break;
      case 'T':
        $filter .= " or (amenity = 'car_wash')";
        break;
      case 'U':
        $filter .= " or (amenity = 'bank')";
        break;
      case 'V':
        $filter .= " or (amenity = 'atm')";
        break;
      case 'X':
        $filter .= " or (historic = 'monastery')";
        break;
      case '1':
        $filter .= " or (tourism = 'attraction' and \"attraction:type\" = 'hiking_route')";
        break;
      case '2':
        $filter .= " or (amenity = 'police')";
        break;
      case '3':
        $filter .= " or (\"natural\" in ('tree', 'stone', 'spring'))";
        break;*/

  return l_filter;
end$$ language plpgsql;
