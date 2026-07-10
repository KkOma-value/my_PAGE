create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'SipNotes User' check (char_length(display_name) between 1 and 50),
  avatar_path text,
  bio text not null default '' check (char_length(bio) <= 200),
  account_status text not null default 'active' check (account_status in ('active', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  province text not null,
  display_name text not null,
  map_x numeric(5, 2) not null check (map_x between 0 and 100),
  map_y numeric(5, 2) not null check (map_y between 0 and 100),
  sort_order integer not null unique,
  active boolean not null default true
);

create table public.city_regions (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  code text not null,
  name text not null,
  display_name text not null,
  map_x numeric(5, 2) not null check (map_x between 0 and 100),
  map_y numeric(5, 2) not null check (map_y between 0 and 100),
  active boolean not null default true,
  unique (city_id, code),
  unique (id, city_id)
);

create table public.checkin_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_client_id text not null check (char_length(local_client_id) between 1 and 100),
  image_upload_status text not null default 'idle'
    check (image_upload_status in ('idle', 'uploading', 'ready', 'failed')),
  image_path text,
  recognition_status text not null default 'idle'
    check (recognition_status in ('idle', 'uploading', 'recognizing', 'ready', 'failed')),
  recognition_suggestions jsonb not null default '{}'::jsonb,
  user_edited_fields text[] not null default '{}',
  draft_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_client_id)
);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  drink_name text not null check (char_length(drink_name) between 1 and 100),
  brand_name text not null check (char_length(brand_name) between 1 and 100),
  store_name text not null default '' check (char_length(store_name) <= 100),
  category text not null check (category in ('coffee', 'milk_tea', 'fruit_tea', 'tea', 'matcha', 'pour_over', 'other')),
  flavor_tags text[] not null default '{}',
  city_id uuid not null references public.cities(id),
  region_id uuid not null,
  image_path text not null,
  caption text not null default '' check (char_length(caption) <= 500),
  visibility text not null check (visibility in ('public', 'private')),
  publish_status text not null default 'published' check (publish_status in ('published', 'deleted')),
  moderation_status text not null default 'visible'
    check (moderation_status in ('visible', 'pending_review', 'hidden')),
  ai_confidence numeric(4, 3) check (ai_confidence between 0 and 1),
  ai_source text not null default 'mock',
  consumed_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (region_id, city_id) references public.city_regions(id, city_id)
);

create table public.seed_recommendations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('city', 'season')),
  city_id uuid references public.cities(id) on delete cascade,
  season text check (season in ('spring', 'summer', 'autumn', 'winter')),
  drink_name text not null,
  brand_name text not null,
  category text not null check (category in ('coffee', 'milk_tea', 'fruit_tea', 'tea', 'matcha', 'pour_over', 'other')),
  image_url text not null,
  badge text not null,
  description text not null,
  sort_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check ((kind = 'city' and city_id is not null and season is null) or
         (kind = 'season' and city_id is null and season is not null))
);

create unique index seed_recommendations_city_unique_idx
  on public.seed_recommendations (city_id, drink_name, brand_name)
  where kind = 'city';
create unique index seed_recommendations_season_unique_idx
  on public.seed_recommendations (season, drink_name, brand_name)
  where kind = 'season';

create table public.recommendation_snapshots (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('city', 'region', 'season', 'personal')),
  scope_id text not null,
  user_id uuid references public.profiles(id) on delete cascade,
  payload jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  source_version text not null default 'v1',
  check ((type = 'personal' and user_id is not null) or (type <> 'personal' and user_id is null))
);

create unique index recommendation_snapshots_public_unique_idx
  on public.recommendation_snapshots (type, scope_id)
  where user_id is null;
create unique index recommendation_snapshots_personal_unique_idx
  on public.recommendation_snapshots (type, scope_id, user_id)
  where user_id is not null;

create table public.personal_preference_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  favorite_categories jsonb not null default '[]'::jsonb,
  frequent_regions jsonb not null default '[]'::jsonb,
  flavor_tags jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now()
);

create table public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, checkin_id)
);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, checkin_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  reason text not null check (reason in ('spam', 'inappropriate', 'harassment', 'privacy', 'other')),
  details text not null default '' check (char_length(details) <= 500),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (reporter_id, checkin_id)
);

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index checkin_drafts_user_updated_idx on public.checkin_drafts (user_id, updated_at desc);
create index checkins_owner_created_idx on public.checkins (user_id, created_at desc);
create index checkins_public_city_idx on public.checkins (city_id, created_at desc)
  where visibility = 'public' and publish_status = 'published' and moderation_status = 'visible';
create index checkins_public_region_idx on public.checkins (region_id, created_at desc)
  where visibility = 'public' and publish_status = 'published' and moderation_status = 'visible';
create index checkins_consumed_on_idx on public.checkins (user_id, consumed_on desc);
create index likes_checkin_idx on public.likes (checkin_id);
create index favorites_checkin_idx on public.favorites (checkin_id);
create index reports_checkin_idx on public.reports (checkin_id, status);
create index blocks_blocked_idx on public.blocks (blocked_id);

alter table public.profiles enable row level security;
alter table public.cities enable row level security;
alter table public.city_regions enable row level security;
alter table public.checkin_drafts enable row level security;
alter table public.checkins enable row level security;
alter table public.seed_recommendations enable row level security;
alter table public.recommendation_snapshots enable row level security;
alter table public.personal_preference_profiles enable row level security;
alter table public.likes enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on table
  public.profiles,
  public.cities,
  public.city_regions,
  public.checkin_drafts,
  public.checkins,
  public.seed_recommendations,
  public.recommendation_snapshots,
  public.personal_preference_profiles,
  public.likes,
  public.favorites,
  public.reports,
  public.blocks
to service_role;

grant select, update on table public.profiles to authenticated;
grant select on table public.cities, public.city_regions, public.seed_recommendations to authenticated;
grant select, insert, update, delete on table public.checkin_drafts, public.checkins to authenticated;
grant select on table public.recommendation_snapshots, public.personal_preference_profiles to authenticated;
grant select, insert, delete on table public.likes, public.favorites, public.blocks to authenticated;
grant select, insert on table public.reports to authenticated;

create policy "profiles owner select"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "profiles owner update"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id and account_status = 'active');

create policy "cities authenticated read"
  on public.cities for select to authenticated
  using (active);
create policy "regions authenticated read"
  on public.city_regions for select to authenticated
  using (active);
create policy "seed recommendations authenticated read"
  on public.seed_recommendations for select to authenticated
  using (active);

create policy "drafts owner select"
  on public.checkin_drafts for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "drafts owner insert"
  on public.checkin_drafts for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "drafts owner update"
  on public.checkin_drafts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "drafts owner delete"
  on public.checkin_drafts for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "checkins owner select"
  on public.checkins for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "checkins public select"
  on public.checkins for select to authenticated
  using (
    visibility = 'public'
    and publish_status = 'published'
    and moderation_status = 'visible'
    and not exists (
      select 1 from public.blocks
      where blocker_id = (select auth.uid()) and blocked_id = checkins.user_id
    )
  );
create policy "checkins owner insert"
  on public.checkins for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "checkins owner update"
  on public.checkins for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "checkins owner delete"
  on public.checkins for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "public snapshots read"
  on public.recommendation_snapshots for select to authenticated
  using (user_id is null);
create policy "personal snapshots read"
  on public.recommendation_snapshots for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "personal profile owner read"
  on public.personal_preference_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "likes owner read"
  on public.likes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "likes owner create"
  on public.likes for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.checkins
      where id = likes.checkin_id
        and visibility = 'public'
        and publish_status = 'published'
        and moderation_status = 'visible'
    )
  );
create policy "likes owner delete"
  on public.likes for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "favorites owner read"
  on public.favorites for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "favorites owner create"
  on public.favorites for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.checkins
      where id = favorites.checkin_id
        and visibility = 'public'
        and publish_status = 'published'
        and moderation_status = 'visible'
    )
  );
create policy "favorites owner delete"
  on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "reports owner read"
  on public.reports for select to authenticated
  using ((select auth.uid()) = reporter_id);
create policy "reports owner create"
  on public.reports for insert to authenticated
  with check (
    (select auth.uid()) = reporter_id
    and exists (
      select 1 from public.checkins
      where id = reports.checkin_id
        and visibility = 'public'
        and publish_status = 'published'
    )
  );

create policy "blocks owner read"
  on public.blocks for select to authenticated
  using ((select auth.uid()) = blocker_id);
create policy "blocks owner create"
  on public.blocks for insert to authenticated
  with check ((select auth.uid()) = blocker_id and blocker_id <> blocked_id);
create policy "blocks owner delete"
  on public.blocks for delete to authenticated
  using ((select auth.uid()) = blocker_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'drink-images',
  'drink-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      'SipNotes User'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

insert into public.profiles (id, display_name)
select
  id,
  coalesce(
    nullif(raw_user_meta_data ->> 'display_name', ''),
    nullif(raw_user_meta_data ->> 'full_name', ''),
    'SipNotes User'
  )
from auth.users
on conflict (id) do nothing;
