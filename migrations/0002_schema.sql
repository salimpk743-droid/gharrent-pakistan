-- GharRent Pakistan marketplace schema
-- Per-user columns use TEXT ids (Better Auth + preview 'dev-user').

create table if not exists profiles (
  user_id text primary key,
  display_name text,
  email text,
  image_url text,
  phone text,
  role text not null default 'USER',
  status text not null default 'ACTIVE',
  google_verified boolean not null default false,
  phone_verified boolean not null default false,
  identity_verified boolean not null default false,
  trusted_advertiser boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create index if not exists profiles_role_idx on profiles (role);
create index if not exists profiles_email_idx on profiles (email);

create table if not exists agencies (
  id text primary key,
  name text not null,
  slug text unique not null,
  logo_url text,
  verified boolean not null default false,
  contact_phone text,
  contact_email text,
  created_at timestamptz not null default now()
);

create table if not exists agency_members (
  agency_id text not null references agencies (id) on delete cascade,
  user_id text not null,
  member_role text not null default 'STAFF',
  created_at timestamptz not null default now(),
  primary key (agency_id, user_id)
);

create table if not exists provinces (
  id text primary key,
  slug text unique not null,
  name text not null,
  sort_order int not null default 0
);

create table if not exists districts (
  id text primary key,
  province_id text not null references provinces (id) on delete cascade,
  slug text not null,
  name text not null,
  unique (province_id, slug)
);

create index if not exists districts_province_idx on districts (province_id);

create table if not exists tehsils (
  id text primary key,
  district_id text not null references districts (id) on delete cascade,
  slug text not null,
  name text not null,
  unique (district_id, slug)
);

create index if not exists tehsils_district_idx on tehsils (district_id);

create table if not exists properties (
  id text primary key,
  owner_id text not null,
  agency_id text,
  title text not null default 'Untitled listing',
  slug text unique not null,
  description text not null default '',
  property_type text not null default 'House',
  listing_purpose text not null default 'RENT',
  status text not null default 'DRAFT',
  province_id text,
  district_id text,
  tehsil_id text,
  area text not null default '',
  address text not null default '',
  latitude double precision,
  longitude double precision,
  monthly_rent int not null default 0,
  security_deposit int,
  advance_rent int,
  bedrooms int not null default 0,
  bathrooms int not null default 0,
  property_size int,
  size_unit text not null default 'MARLA',
  floor int,
  total_floors int,
  furnished_status text not null default 'UNFURNISHED',
  parking boolean not null default false,
  electricity boolean not null default true,
  gas boolean not null default false,
  water boolean not null default true,
  maintenance boolean not null default false,
  family_allowed boolean not null default true,
  bachelor_allowed boolean not null default false,
  pets_allowed boolean not null default false,
  contact_phone text not null default '',
  contact_whatsapp text,
  available_from date,
  is_featured boolean not null default false,
  is_sample boolean not null default false,
  rejection_reason text,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  expires_at timestamptz,
  deleted_at timestamptz
);

create index if not exists properties_owner_idx on properties (owner_id);
create index if not exists properties_status_idx on properties (status);
create index if not exists properties_location_idx on properties (province_id, district_id, property_type, monthly_rent);
create index if not exists properties_published_idx on properties (published_at desc);
create index if not exists properties_featured_idx on properties (is_featured, published_at desc);
create index if not exists properties_expires_idx on properties (expires_at);

create table if not exists property_images (
  id text primary key,
  property_id text not null references properties (id) on delete cascade,
  storage_key text not null,
  url text,
  mime_type text not null default 'image/jpeg',
  byte_data text,
  width int,
  height int,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists property_images_property_idx on property_images (property_id, sort_order);

create table if not exists favorites (
  user_id text not null,
  property_id text not null references properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create index if not exists favorites_property_idx on favorites (property_id);

create table if not exists reports (
  id text primary key,
  property_id text not null,
  reporter_id text not null,
  reason text not null,
  details text,
  status text not null default 'OPEN',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by text
);

create unique index if not exists reports_one_open_idx on reports (property_id, reporter_id) where status = 'OPEN';
create index if not exists reports_status_idx on reports (status, created_at desc);

create table if not exists listing_events (
  id text primary key,
  property_id text not null,
  user_id text,
  event_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists listing_events_property_idx on listing_events (property_id, event_type);
create index if not exists listing_events_created_idx on listing_events (created_at desc);

create table if not exists audit_log (
  id text primary key,
  actor_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  meta text,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_entity_idx on audit_log (entity_type, entity_id);
create index if not exists audit_log_created_idx on audit_log (created_at desc);

create table if not exists platform_settings (
  key text primary key,
  value text not null
);

create table if not exists contact_messages (
  id text primary key,
  user_id text,
  name text,
  email text,
  subject text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

insert into platform_settings (key, value) values
  ('auto_publish', 'false'),
  ('listing_duration_days', '60'),
  ('expiry_warning_days', '7'),
  ('show_sample_listings', 'true'),
  ('max_images_per_listing', '8'),
  ('max_image_bytes', '1500000')
on conflict (key) do nothing;
