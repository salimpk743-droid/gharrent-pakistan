-- Structured neighbourhoods (Province → City/district → Area) and purpose index.
-- listing_purpose already exists on properties with default 'RENT'.

create table if not exists areas (
  id text primary key,
  district_id text not null references districts (id) on delete cascade,
  slug text not null,
  name text not null,
  aliases text not null default '',
  unique (district_id, slug)
);

create index if not exists areas_district_idx on areas (district_id);
create index if not exists areas_name_idx on areas (lower(name));

alter table properties add column if not exists area_id text;

create index if not exists properties_area_id_idx on properties (area_id);
create index if not exists properties_purpose_status_idx on properties (listing_purpose, status);

update properties
set listing_purpose = 'RENT'
where listing_purpose is null or listing_purpose = '';
