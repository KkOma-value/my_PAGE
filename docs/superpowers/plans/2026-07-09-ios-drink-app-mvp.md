# iOS Drink App MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first iOS App Store-oriented drink check-in MVP in `mobile/`, backed by Vercel API routes and Supabase Auth/Postgres/Storage.

**Architecture:** Mobile remains the primary product surface. Vercel Next.js API routes verify Supabase users, perform privileged writes, run mock recognition, and generate recommendation snapshots. Supabase stores auth users, app data, images, and recommendation snapshots with RLS separating private user data from public community data.

**Tech Stack:** Expo Router 57, React Native 0.86, Next.js 16, TypeScript, Supabase Auth/Postgres/Storage, Vercel Cron, Zod, Vitest for pure TypeScript tests.

## Global Constraints

- Primary product target: `mobile/` iOS app.
- Prototype backend: Supabase + Vercel.
- Authentication: phone OTP and Sign in with Apple.
- Prototype AI: mock/rule-based recognition only.
- Recognition must be asynchronous and must not block user form editing.
- Recognition suggestions fill only empty fields; edited fields show optional suggestions.
- Visibility: public check-ins enter shared recommendations; private check-ins enter only personal recommendations.
- Community v1: likes, favorites, reports, blocks; no comments and no follow feeds.
- Map v1: static China map with city and district heat indicators.
- City coverage: 30 seed cities.
- Seed content: 5 specialty drinks per city and 8 seasonal recommendations per season.
- Recommendation page reads precomputed snapshots and never waits on analysis.
- Location permission only fills city/district; do not store precise lat/lng by default.
- Supabase RLS must be enabled on all exposed tables.
- `service_role` must stay server-side only.
- iOS permission copy must cover camera, photo library, and location.
- Before editing Expo code, read exact Expo v57 docs as required by `mobile/AGENTS.md`.

## Execution Corrections (2026-07-10)

Current platform documentation and baseline review require these corrections while preserving approved scope:

- Initialize Supabase server clients lazily so `next build` does not require runtime secrets.
- Keep `drink-images` private. Persist object paths, then return short-lived signed URLs only after authorization.
- Add explicit Data API grants because new Supabase projects no longer expose new public tables automatically.
- Use Expo config plugins and `ios.usesAppleSignIn`; do not place literal `$EXPO_PUBLIC_*` strings in static `app.json` extras.
- Add an authentication gate, city/region lookup, and foreground location-to-city suggestion to make phone OTP, Apple login, and location usable.
- Generate city, region, season, and personal recommendation snapshots; community reads exclude blocked users.
- Add tests for pure mobile state/config/location/heat logic before implementation.

---

## Scope Check

This is one vertical-slice plan, not several independent plans. Each task produces a testable layer that supports the next task: schema/auth, server APIs, recommendations/community, mobile service layer, mobile screens, and iOS readiness.

## File Structure

### Root API And Backend

- `package.json`: add Supabase and Vitest dependencies plus test scripts.
- `.env.example`: document required Vercel/Supabase env vars.
- `vitest.config.ts`: root TypeScript test config.
- `lib/supabase/server.ts`: Supabase clients for server-side auth and privileged writes.
- `lib/api/auth.ts`: bearer-token verification helper.
- `lib/api/responses.ts`: typed JSON success/error helpers.
- `lib/mobile/contracts.ts`: shared API contracts used by server routes.
- `lib/mobile/mock-recognition.ts`: deterministic prototype recognition.
- `lib/recommendations/snapshots.ts`: snapshot aggregation helpers.
- `app/api/mobile/drafts/route.ts`: draft create/list endpoint.
- `app/api/mobile/drafts/[id]/route.ts`: draft update/delete endpoint.
- `app/api/mobile/drafts/[id]/image/route.ts`: image upload endpoint.
- `app/api/mobile/drafts/[id]/recognize/route.ts`: mock recognition endpoint.
- `app/api/mobile/checkins/route.ts`: publish/list check-ins endpoint.
- `app/api/mobile/checkins/[id]/like/route.ts`: like toggle endpoint.
- `app/api/mobile/checkins/[id]/favorite/route.ts`: favorite toggle endpoint.
- `app/api/mobile/checkins/[id]/report/route.ts`: report endpoint.
- `app/api/mobile/users/[id]/block/route.ts`: block endpoint.
- `app/api/mobile/discover/route.ts`: city/season/personal recommendations endpoint.
- `app/api/mobile/map-heat/route.ts`: city/district heat endpoint.
- `app/api/cron/recommendations/route.ts`: Vercel Cron endpoint.
- `app/api/mobile/account/delete/route.ts`: account deletion endpoint.

### Supabase

- `supabase/migrations/20260709000100_ios_drink_app_mvp.sql`: tables, RLS, policies, indexes, seed rows.
- `supabase/seed/ios_drink_seed.sql`: optional repeatable seed data if local workflow separates schema and seed.

### Mobile App

- `mobile/package.json`: add Supabase, Apple auth, SecureStore, Location dependencies.
- `mobile/app.json`: add app name, bundle id target, permission strings, and public extra config.
- `mobile/src/constants/Config.ts`: production-safe API and Supabase config.
- `mobile/src/types/app.ts`: mobile domain types matching API contracts.
- `mobile/src/lib/api.ts`: authenticated API client.
- `mobile/src/lib/supabase.ts`: Supabase mobile client with secure session storage.
- `mobile/src/lib/auth.ts`: phone OTP, Apple login, logout, delete account.
- `mobile/src/lib/drafts.ts`: async draft upload/recognition state machine.
- `mobile/src/lib/recommendations.ts`: discover/map/profile data clients.
- `mobile/src/lib/map.ts`: heat adapter for static map markers.
- `mobile/src/app/_layout.tsx`: tabs changed to Check In / Map / Discover / Profile.
- `mobile/src/app/check-in.tsx`: first-class check-in tab.
- `mobile/src/app/index.tsx`: map tab.
- `mobile/src/app/discover.tsx`: city/season/personal recommendations.
- `mobile/src/app/profile.tsx`: profile, calendar, favorites, privacy/safety actions.
- `mobile/src/components/DrinkCalendar.tsx`: month calendar with drink thumbnails.
- `mobile/src/components/CommunityActions.tsx`: like, favorite, report, block UI.
- `mobile/src/components/VisibilitySelector.tsx`: public/private publish selector.
- `mobile/src/components/RecognitionSuggestionBar.tsx`: non-blocking AI suggestion display.

## Task 1: Project Dependencies And Environment Contract

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `.env.example`
- Modify: `mobile/package.json`
- Modify: `mobile/app.json`
- Modify: `mobile/src/constants/Config.ts`

**Interfaces:**
- Produces: `API_URL`, `API_BASE`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` exported from `mobile/src/constants/Config.ts`.
- Produces: root `npm test` script that runs pure TypeScript tests.

- [ ] **Step 1: Read versioned docs required by local instructions**

Run:

```bash
sed -n '1,80p' mobile/AGENTS.md
```

Expected: output includes `Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.`

Open:

```text
https://docs.expo.dev/versions/v57.0.0/
https://docs.expo.dev/versions/v57.0.0/sdk/apple-authentication/
https://docs.expo.dev/versions/v57.0.0/sdk/location/
https://docs.expo.dev/versions/v57.0.0/sdk/securestore/
```

- [ ] **Step 2: Install root backend/test dependencies**

Run:

```bash
npm install @supabase/supabase-js
npm install -D vitest
```

Expected: `package.json` and `package-lock.json` change.

- [ ] **Step 3: Add root test config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 4: Add scripts to root package**

Modify `package.json` scripts to include:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Keep existing scripts unchanged.

- [ ] **Step 5: Install mobile dependencies**

Run:

```bash
cd mobile
npm install @supabase/supabase-js expo-apple-authentication expo-secure-store expo-location
```

Expected: `mobile/package.json` and `mobile/package-lock.json` change.

- [ ] **Step 6: Write environment sample**

Create `.env.example`:

```bash
# Vercel / Next.js server
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MOBILE_API_URL=https://your-vercel-app.vercel.app
CRON_SECRET=replace-with-long-random-secret

# Expo public config
EXPO_PUBLIC_API_URL=https://your-vercel-app.vercel.app
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

- [ ] **Step 7: Update iOS app config**

Modify `mobile/app.json` `expo` object with these values:

```json
{
  "name": "SipNotes",
  "slug": "sipnotes",
  "scheme": "sipnotes",
  "ios": {
    "icon": "./assets/expo.icon",
    "bundleIdentifier": "com.sipnotes.app",
    "infoPlist": {
      "NSCameraUsageDescription": "SipNotes uses the camera so you can photograph drinks for check-ins.",
      "NSPhotoLibraryUsageDescription": "SipNotes uses your photo library so you can choose drink photos for check-ins.",
      "NSLocationWhenInUseUsageDescription": "SipNotes uses your location to fill city and district for drink check-ins and recommendations."
    }
  },
  "extra": {
    "apiUrl": "$EXPO_PUBLIC_API_URL",
    "supabaseUrl": "$EXPO_PUBLIC_SUPABASE_URL",
    "supabaseAnonKey": "$EXPO_PUBLIC_SUPABASE_ANON_KEY"
  }
}
```

Keep existing splash screen, plugins, and experiments.

- [ ] **Step 8: Make mobile config production-safe**

Replace `mobile/src/constants/Config.ts` with:

```ts
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

function getLocalServerUrl() {
  const host = Constants.expoConfig?.hostUri?.split(':').shift();
  if (host) return `http://${host}:5555`;
  return 'http://localhost:5555';
}

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof extra.apiUrl === 'string' && extra.apiUrl.length > 0 ? extra.apiUrl : getLocalServerUrl());

export const API_BASE = `${API_URL.replace(/\/$/, '')}/api/mobile`;

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  (typeof extra.supabaseUrl === 'string' ? extra.supabaseUrl : '');

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof extra.supabaseAnonKey === 'string' ? extra.supabaseAnonKey : '');
```

- [ ] **Step 9: Verify dependency task**

Run:

```bash
npm test -- --passWithNoTests
npm run lint
cd mobile && npm run lint
```

Expected: commands complete. If lint reports pre-existing warnings, record them in the task handoff before proceeding.

- [ ] **Step 10: Commit**

Run:

```bash
git add package.json package-lock.json vitest.config.ts .env.example mobile/package.json mobile/package-lock.json mobile/app.json mobile/src/constants/Config.ts
git commit -m "chore: configure mobile Supabase prototype environment"
```

## Task 2: Supabase Schema, RLS, And Seed Data

**Files:**
- Create: `supabase/migrations/20260709000100_ios_drink_app_mvp.sql`
- Create: `supabase/seed/ios_drink_seed.sql`
- Create: `lib/mobile/contracts.ts`
- Test: `lib/mobile/contracts.test.ts`

**Interfaces:**
- Produces: database tables `profiles`, `cities`, `city_regions`, `checkin_drafts`, `checkins`, `seed_recommendations`, `recommendation_snapshots`, `personal_preference_profiles`, `likes`, `favorites`, `reports`, `blocks`.
- Produces: TypeScript union types `CheckInVisibility`, `ModerationStatus`, `RecognitionStatus`, `RecommendationSnapshotType`.

- [ ] **Step 1: Write contract tests first**

Create `lib/mobile/contracts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CHECKIN_VISIBILITIES, MODERATION_STATUSES, RECOGNITION_STATUSES, SNAPSHOT_TYPES } from "./contracts";

describe("mobile contracts", () => {
  it("defines stable visibility values", () => {
    expect(CHECKIN_VISIBILITIES).toEqual(["public", "private"]);
  });

  it("defines moderation states used by public surfaces", () => {
    expect(MODERATION_STATUSES).toEqual(["visible", "pending_review", "hidden"]);
  });

  it("defines async recognition states", () => {
    expect(RECOGNITION_STATUSES).toEqual(["idle", "uploading", "recognizing", "ready", "failed"]);
  });

  it("defines discover snapshot types", () => {
    expect(SNAPSHOT_TYPES).toEqual(["city", "region", "season", "personal"]);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm test -- lib/mobile/contracts.test.ts
```

Expected: FAIL with module-not-found for `./contracts`.

- [ ] **Step 3: Add TypeScript contracts**

Create `lib/mobile/contracts.ts`:

```ts
export const CHECKIN_VISIBILITIES = ["public", "private"] as const;
export type CheckInVisibility = (typeof CHECKIN_VISIBILITIES)[number];

export const MODERATION_STATUSES = ["visible", "pending_review", "hidden"] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export const RECOGNITION_STATUSES = ["idle", "uploading", "recognizing", "ready", "failed"] as const;
export type RecognitionStatus = (typeof RECOGNITION_STATUSES)[number];

export const SNAPSHOT_TYPES = ["city", "region", "season", "personal"] as const;
export type RecommendationSnapshotType = (typeof SNAPSHOT_TYPES)[number];

export type DrinkCategoryKey = "coffee" | "milk_tea" | "fruit_tea" | "tea" | "matcha" | "pour_over" | "other";

export interface RecognitionSuggestion {
  category: DrinkCategoryKey;
  brandName: string;
  storeName: string;
  drinkName: string;
  flavorTags: string[];
  confidence: number;
}
```

- [ ] **Step 4: Run contract test**

Run:

```bash
npm test -- lib/mobile/contracts.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create Supabase migration**

Create `supabase/migrations/20260709000100_ios_drink_app_mvp.sql` with:

```sql
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'SipNotes User',
  avatar_url text,
  bio text not null default '',
  account_status text not null default 'active' check (account_status in ('active', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  province text not null,
  display_name text not null,
  map_x numeric not null,
  map_y numeric not null,
  sort_order integer not null,
  active boolean not null default true
);

create table if not exists public.city_regions (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  code text not null,
  name text not null,
  display_name text not null,
  map_x numeric not null,
  map_y numeric not null,
  active boolean not null default true,
  unique (city_id, code)
);

create table if not exists public.checkin_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_client_id text not null,
  image_upload_status text not null default 'idle' check (image_upload_status in ('idle', 'uploading', 'ready', 'failed')),
  image_url text,
  recognition_status text not null default 'idle' check (recognition_status in ('idle', 'uploading', 'recognizing', 'ready', 'failed')),
  recognition_suggestions jsonb not null default '{}'::jsonb,
  user_edited_fields text[] not null default '{}',
  draft_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_client_id)
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  drink_name text not null,
  brand_name text not null,
  store_name text not null default '',
  category text not null,
  flavor_tags text[] not null default '{}',
  city_id uuid not null references public.cities(id),
  region_id uuid not null references public.city_regions(id),
  image_url text not null,
  caption text not null default '',
  visibility text not null check (visibility in ('public', 'private')),
  publish_status text not null default 'published' check (publish_status in ('published', 'deleted')),
  moderation_status text not null default 'visible' check (moderation_status in ('visible', 'pending_review', 'hidden')),
  ai_confidence numeric,
  ai_source text not null default 'mock',
  date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seed_recommendations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('city', 'season')),
  city_id uuid references public.cities(id) on delete cascade,
  season text check (season in ('spring', 'summer', 'autumn', 'winter')),
  drink_name text not null,
  brand_name text not null,
  category text not null,
  image_url text not null,
  badge text not null,
  description text not null,
  sort_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendation_snapshots (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('city', 'region', 'season', 'personal')),
  scope_id text not null,
  user_id uuid references public.profiles(id) on delete cascade,
  payload jsonb not null,
  generated_at timestamptz not null default now(),
  source_version text not null default 'v1'
);

create table if not exists public.personal_preference_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  favorite_categories jsonb not null default '[]'::jsonb,
  frequent_regions jsonb not null default '[]'::jsonb,
  flavor_tags jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now()
);

create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, checkin_id)
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, checkin_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  reason text not null,
  details text not null default '',
  created_at timestamptz not null default now(),
  unique (reporter_id, checkin_id)
);

create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index if not exists checkins_public_lookup_idx
  on public.checkins (visibility, moderation_status, publish_status, city_id, region_id, date);

create index if not exists recommendation_snapshots_lookup_idx
  on public.recommendation_snapshots (type, scope_id, user_id, generated_at desc);

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

create policy "profiles owner select" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles owner update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "cities readable" on public.cities for select to authenticated using (active = true);
create policy "regions readable" on public.city_regions for select to authenticated using (active = true);
create policy "draft owner all" on public.checkin_drafts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "checkins owner select" on public.checkins for select to authenticated using ((select auth.uid()) = user_id);
create policy "checkins public select" on public.checkins for select to authenticated using (visibility = 'public' and publish_status = 'published' and moderation_status = 'visible');
create policy "seed readable" on public.seed_recommendations for select to authenticated using (active = true);
create policy "snapshots public readable" on public.recommendation_snapshots for select to authenticated using (user_id is null);
create policy "snapshots owner readable" on public.recommendation_snapshots for select to authenticated using ((select auth.uid()) = user_id);
create policy "personal owner select" on public.personal_preference_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "likes owner all" on public.likes for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "favorites owner all" on public.favorites for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "reports owner insert" on public.reports for insert to authenticated with check ((select auth.uid()) = reporter_id);
create policy "reports owner select" on public.reports for select to authenticated using ((select auth.uid()) = reporter_id);
create policy "blocks owner all" on public.blocks for all to authenticated using ((select auth.uid()) = blocker_id) with check ((select auth.uid()) = blocker_id);
```

- [ ] **Step 6: Add seed data file**

Create `supabase/seed/ios_drink_seed.sql` with 30 cities and one region per city first. Include all 30 city rows from the spec. Start with this structure:

```sql
insert into public.cities (code, name, province, display_name, map_x, map_y, sort_order)
values
  ('shanghai', 'Shanghai', 'Shanghai', '上海', 70, 40, 1),
  ('beijing', 'Beijing', 'Beijing', '北京', 65, 30, 2),
  ('guangzhou', 'Guangzhou', 'Guangdong', '广州', 68, 75, 3),
  ('shenzhen', 'Shenzhen', 'Guangdong', '深圳', 67, 78, 4),
  ('chengdu', 'Chengdu', 'Sichuan', '成都', 60, 60, 5),
  ('chongqing', 'Chongqing', 'Chongqing', '重庆', 52, 62, 6),
  ('hangzhou', 'Hangzhou', 'Zhejiang', '杭州', 70, 46, 7),
  ('suzhou', 'Suzhou', 'Jiangsu', '苏州', 69, 43, 8),
  ('nanjing', 'Nanjing', 'Jiangsu', '南京', 68, 41, 9),
  ('wuhan', 'Wuhan', 'Hubei', '武汉', 61, 52, 10),
  ('xian', 'Xi''an', 'Shaanxi', '西安', 48, 45, 11),
  ('changsha', 'Changsha', 'Hunan', '长沙', 59, 61, 12),
  ('tianjin', 'Tianjin', 'Tianjin', '天津', 66, 33, 13),
  ('qingdao', 'Qingdao', 'Shandong', '青岛', 70, 39, 14),
  ('xiamen', 'Xiamen', 'Fujian', '厦门', 72, 68, 15),
  ('fuzhou', 'Fuzhou', 'Fujian', '福州', 72, 64, 16),
  ('ningbo', 'Ningbo', 'Zhejiang', '宁波', 73, 48, 17),
  ('zhengzhou', 'Zhengzhou', 'Henan', '郑州', 57, 45, 18),
  ('jinan', 'Jinan', 'Shandong', '济南', 66, 38, 19),
  ('shenyang', 'Shenyang', 'Liaoning', '沈阳', 74, 22, 20),
  ('dalian', 'Dalian', 'Liaoning', '大连', 73, 31, 21),
  ('harbin', 'Harbin', 'Heilongjiang', '哈尔滨', 74, 14, 22),
  ('kunming', 'Kunming', 'Yunnan', '昆明', 43, 70, 23),
  ('guiyang', 'Guiyang', 'Guizhou', '贵阳', 52, 67, 24),
  ('nanning', 'Nanning', 'Guangxi', '南宁', 56, 76, 25),
  ('hefei', 'Hefei', 'Anhui', '合肥', 65, 48, 26),
  ('wuxi', 'Wuxi', 'Jiangsu', '无锡', 70, 44, 27),
  ('foshan', 'Foshan', 'Guangdong', '佛山', 67, 75, 28),
  ('dongguan', 'Dongguan', 'Guangdong', '东莞', 68, 77, 29),
  ('sanya', 'Sanya', 'Hainan', '三亚', 59, 88, 30)
on conflict (code) do update set display_name = excluded.display_name;
```

Add seed recommendations in the same file. For each city, insert 5 city rows. For each season, insert 8 season rows. Use `image_url` values from current `mobile/src/data.ts` or Unsplash prototype URLs already present in the repo.

- [ ] **Step 7: Validate SQL locally when Supabase CLI is available**

Run:

```bash
supabase --help
supabase db reset
```

Expected: reset applies migration and seed without SQL errors. If Supabase CLI is not configured, run this fallback syntax check:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260709000100_ios_drink_app_mvp.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/seed/ios_drink_seed.sql
```

- [ ] **Step 8: Commit**

Run:

```bash
git add lib/mobile/contracts.ts lib/mobile/contracts.test.ts supabase/migrations/20260709000100_ios_drink_app_mvp.sql supabase/seed/ios_drink_seed.sql
git commit -m "feat: add Supabase drink app schema"
```

## Task 3: Server Auth, Response, And Supabase Helpers

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/api/responses.ts`
- Create: `lib/api/auth.ts`
- Test: `lib/api/responses.test.ts`

**Interfaces:**
- Produces: `jsonOk<T>(data: T, init?: ResponseInit): NextResponse`
- Produces: `jsonError(code: string, message: string, status: number): NextResponse`
- Produces: `requireUser(request: NextRequest): Promise<{ userId: string; accessToken: string }>`
- Produces: `supabaseAdmin` for service-role server work only.

- [ ] **Step 1: Write response helper test**

Create `lib/api/responses.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { jsonErrorPayload, jsonOkPayload } from "./responses";

describe("API response payloads", () => {
  it("wraps success data", () => {
    expect(jsonOkPayload({ id: "1" })).toEqual({ success: true, data: { id: "1" } });
  });

  it("wraps errors", () => {
    expect(jsonErrorPayload("BAD_INPUT", "Invalid request")).toEqual({
      success: false,
      error: { code: "BAD_INPUT", message: "Invalid request" },
    });
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm test -- lib/api/responses.test.ts
```

Expected: FAIL with module-not-found for `./responses`.

- [ ] **Step 3: Add response helpers**

Create `lib/api/responses.ts`:

```ts
import { NextResponse } from "next/server";

export function jsonOkPayload<T>(data: T) {
  return { success: true as const, data };
}

export function jsonErrorPayload(code: string, message: string) {
  return { success: false as const, error: { code, message } };
}

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(jsonOkPayload(data), init);
}

export function jsonError(code: string, message: string, status: number): NextResponse {
  return NextResponse.json(jsonErrorPayload(code, message), { status });
}
```

- [ ] **Step 4: Add Supabase server clients**

Create `lib/supabase/server.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

if (!supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
```

- [ ] **Step 5: Add bearer auth helper**

Create `lib/api/auth.ts`:

```ts
import type { NextRequest } from "next/server";
import { supabaseAuth } from "@/lib/supabase/server";

export interface AuthenticatedUser {
  userId: string;
  accessToken: string;
}

export async function requireUser(request: NextRequest): Promise<AuthenticatedUser> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

  if (!token) {
    throw Object.assign(new Error("Missing bearer token"), { status: 401, code: "UNAUTHORIZED" });
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) {
    throw Object.assign(new Error("Invalid session"), { status: 401, code: "UNAUTHORIZED" });
  }

  return { userId: data.user.id, accessToken: token };
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test -- lib/api/responses.test.ts
npm run lint
```

Expected: PASS for test; lint completes.

- [ ] **Step 7: Commit**

Run:

```bash
git add lib/supabase/server.ts lib/api/responses.ts lib/api/auth.ts lib/api/responses.test.ts
git commit -m "feat: add mobile API auth helpers"
```

## Task 4: Draft, Upload, Recognition, And Publish APIs

**Files:**
- Create: `lib/mobile/mock-recognition.ts`
- Test: `lib/mobile/mock-recognition.test.ts`
- Create: `app/api/mobile/drafts/route.ts`
- Create: `app/api/mobile/drafts/[id]/route.ts`
- Create: `app/api/mobile/drafts/[id]/image/route.ts`
- Create: `app/api/mobile/drafts/[id]/recognize/route.ts`
- Create: `app/api/mobile/checkins/route.ts`

**Interfaces:**
- Produces: `recognizeDrinkFromImage(imageUrl: string): RecognitionSuggestion`
- Produces: draft endpoints that use authenticated `userId`.
- Produces: publish endpoint requiring image, drink name, category, city, region, and visibility.

- [ ] **Step 1: Write recognition tests**

Create `lib/mobile/mock-recognition.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { recognizeDrinkFromImage } from "./mock-recognition";

describe("recognizeDrinkFromImage", () => {
  it("recognizes coffee-like image names", () => {
    expect(recognizeDrinkFromImage("/uploads/iced-coffee.jpg")).toMatchObject({
      category: "coffee",
      brandName: "Manner 咖啡",
      drinkName: "冰拿铁",
    });
  });

  it("returns stable fallback suggestions", () => {
    expect(recognizeDrinkFromImage("/uploads/photo-123.jpg")).toMatchObject({
      category: "tea",
      confidence: 0.62,
    });
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm test -- lib/mobile/mock-recognition.test.ts
```

Expected: FAIL with module-not-found for `./mock-recognition`.

- [ ] **Step 3: Implement mock recognition**

Create `lib/mobile/mock-recognition.ts`:

```ts
import type { RecognitionSuggestion } from "./contracts";

export function recognizeDrinkFromImage(imageUrl: string): RecognitionSuggestion {
  const lower = imageUrl.toLowerCase();

  if (lower.includes("coffee") || lower.includes("latte")) {
    return {
      category: "coffee",
      brandName: "Manner 咖啡",
      storeName: "城市门店",
      drinkName: "冰拿铁",
      flavorTags: ["坚果香", "奶香"],
      confidence: 0.86,
    };
  }

  if (lower.includes("milk") || lower.includes("bubble")) {
    return {
      category: "milk_tea",
      brandName: "喜茶",
      storeName: "城市门店",
      drinkName: "芋泥厚牛乳",
      flavorTags: ["奶香", "浓郁"],
      confidence: 0.82,
    };
  }

  if (lower.includes("fruit") || lower.includes("lemon")) {
    return {
      category: "fruit_tea",
      brandName: "茶百道",
      storeName: "城市门店",
      drinkName: "爆柠四季春",
      flavorTags: ["果香", "清爽"],
      confidence: 0.8,
    };
  }

  return {
    category: "tea",
    brandName: "山中茶寮",
    storeName: "城市门店",
    drinkName: "高山冷泡乌龙",
    flavorTags: ["草木香", "回甘"],
    confidence: 0.62,
  };
}
```

- [ ] **Step 4: Implement draft create/list route**

Create `app/api/mobile/drafts/route.ts`:

```ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/server";

const createDraftSchema = z.object({
  localClientId: z.string().min(1),
  draftPayload: z.record(z.unknown()).default({}),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const { data, error } = await supabaseAdmin
      .from("checkin_drafts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) return jsonError("DRAFTS_READ_FAILED", error.message, 500);
    return jsonOk(data ?? []);
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
    return jsonError("UNAUTHORIZED", error instanceof Error ? error.message : "Unauthorized", status);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const parsed = createDraftSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("INVALID_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request", 400);

    const { data, error } = await supabaseAdmin
      .from("checkin_drafts")
      .upsert({
        user_id: userId,
        local_client_id: parsed.data.localClientId,
        draft_payload: parsed.data.draftPayload,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,local_client_id" })
      .select("*")
      .single();

    if (error) return jsonError("DRAFT_CREATE_FAILED", error.message, 500);
    return jsonOk(data, { status: 201 });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
    return jsonError("DRAFT_CREATE_FAILED", error instanceof Error ? error.message : "Draft create failed", status);
  }
}
```

- [ ] **Step 5: Implement draft update/delete route**

Create `app/api/mobile/drafts/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/server";

const updateDraftSchema = z.object({
  draftPayload: z.record(z.unknown()).optional(),
  userEditedFields: z.array(z.string()).optional(),
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    const parsed = updateDraftSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("INVALID_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request", 400);

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.draftPayload) update.draft_payload = parsed.data.draftPayload;
    if (parsed.data.userEditedFields) update.user_edited_fields = parsed.data.userEditedFields;

    const { data, error } = await supabaseAdmin
      .from("checkin_drafts")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) return jsonError("DRAFT_UPDATE_FAILED", error.message, 500);
    return jsonOk(data);
  } catch (error) {
    return jsonError("DRAFT_UPDATE_FAILED", error instanceof Error ? error.message : "Draft update failed", 500);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    const { error } = await supabaseAdmin.from("checkin_drafts").delete().eq("id", id).eq("user_id", userId);
    if (error) return jsonError("DRAFT_DELETE_FAILED", error.message, 500);
    return jsonOk({ id });
  } catch (error) {
    return jsonError("DRAFT_DELETE_FAILED", error instanceof Error ? error.message : "Draft delete failed", 500);
  }
}
```

- [ ] **Step 6: Implement upload route using Supabase Storage**

Create `app/api/mobile/drafts/[id]/image/route.ts`:

```ts
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { requireUser } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) return jsonError("MISSING_FILE", "No image file provided", 400);
    if (!ALLOWED_TYPES.has(file.type)) return jsonError("INVALID_FILE_TYPE", "Image must be JPEG, PNG, or WEBP", 400);
    if (file.size > MAX_FILE_SIZE) return jsonError("FILE_TOO_LARGE", "Image must be 5MB or smaller", 400);

    await supabaseAdmin.from("checkin_drafts").update({
      image_upload_status: "uploading",
      recognition_status: "uploading",
      updated_at: new Date().toISOString(),
    }).eq("id", id).eq("user_id", userId);

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/${id}/${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await supabaseAdmin.storage.from("drink-images").upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (upload.error) return jsonError("UPLOAD_FAILED", upload.error.message, 500);

    const { data: publicUrl } = supabaseAdmin.storage.from("drink-images").getPublicUrl(path);
    const imageUrl = publicUrl.publicUrl;

    const { data, error } = await supabaseAdmin.from("checkin_drafts").update({
      image_upload_status: "ready",
      image_url: imageUrl,
      recognition_status: "idle",
      updated_at: new Date().toISOString(),
    }).eq("id", id).eq("user_id", userId).select("*").single();

    if (error) return jsonError("DRAFT_IMAGE_UPDATE_FAILED", error.message, 500);
    return jsonOk(data);
  } catch (error) {
    return jsonError("UPLOAD_FAILED", error instanceof Error ? error.message : "Upload failed", 500);
  }
}
```

- [ ] **Step 7: Implement recognition route**

Create `app/api/mobile/drafts/[id]/recognize/route.ts`:

```ts
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/server";
import { recognizeDrinkFromImage } from "@/lib/mobile/mock-recognition";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;

    const draft = await supabaseAdmin.from("checkin_drafts").select("*").eq("id", id).eq("user_id", userId).single();
    if (draft.error || !draft.data) return jsonError("DRAFT_NOT_FOUND", "Draft not found", 404);
    if (!draft.data.image_url) return jsonError("IMAGE_REQUIRED", "Upload an image before recognition", 400);

    await supabaseAdmin.from("checkin_drafts").update({
      recognition_status: "recognizing",
      updated_at: new Date().toISOString(),
    }).eq("id", id).eq("user_id", userId);

    const suggestion = recognizeDrinkFromImage(draft.data.image_url);
    const { data, error } = await supabaseAdmin.from("checkin_drafts").update({
      recognition_status: "ready",
      recognition_suggestions: suggestion,
      updated_at: new Date().toISOString(),
    }).eq("id", id).eq("user_id", userId).select("*").single();

    if (error) return jsonError("RECOGNITION_SAVE_FAILED", error.message, 500);
    return jsonOk(data);
  } catch (error) {
    return jsonError("RECOGNITION_FAILED", error instanceof Error ? error.message : "Recognition failed", 500);
  }
}
```

- [ ] **Step 8: Implement publish/list route**

Create `app/api/mobile/checkins/route.ts`:

```ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/server";

const publishSchema = z.object({
  draftId: z.string().uuid().optional(),
  drinkName: z.string().min(1),
  brandName: z.string().min(1),
  storeName: z.string().default(""),
  category: z.string().min(1),
  flavorTags: z.array(z.string()).default([]),
  cityId: z.string().uuid(),
  regionId: z.string().uuid(),
  imageUrl: z.string().url(),
  caption: z.string().default(""),
  visibility: z.enum(["public", "private"]),
  aiConfidence: z.number().min(0).max(1).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const url = new URL(request.url);
    const includePublic = url.searchParams.get("public") === "true";
    let query = supabaseAdmin.from("checkins").select("*, cities(*), city_regions(*)").eq("publish_status", "published");

    query = includePublic
      ? query.or(`user_id.eq.${userId},and(visibility.eq.public,moderation_status.eq.visible)`)
      : query.eq("user_id", userId);

    const { data, error } = await query.order("created_at", { ascending: false }).limit(100);
    if (error) return jsonError("CHECKINS_READ_FAILED", error.message, 500);
    return jsonOk(data ?? []);
  } catch (error) {
    return jsonError("CHECKINS_READ_FAILED", error instanceof Error ? error.message : "Check-ins read failed", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const parsed = publishSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("INVALID_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request", 400);

    const { draftId, ...payload } = parsed.data;
    const { data, error } = await supabaseAdmin.from("checkins").insert({
      user_id: userId,
      drink_name: payload.drinkName,
      brand_name: payload.brandName,
      store_name: payload.storeName,
      category: payload.category,
      flavor_tags: payload.flavorTags,
      city_id: payload.cityId,
      region_id: payload.regionId,
      image_url: payload.imageUrl,
      caption: payload.caption,
      visibility: payload.visibility,
      moderation_status: payload.caption.includes("违禁") ? "pending_review" : "visible",
      ai_confidence: payload.aiConfidence,
      ai_source: "mock",
    }).select("*").single();

    if (error) return jsonError("CHECKIN_CREATE_FAILED", error.message, 500);
    if (draftId) await supabaseAdmin.from("checkin_drafts").delete().eq("id", draftId).eq("user_id", userId);
    return jsonOk(data, { status: 201 });
  } catch (error) {
    return jsonError("CHECKIN_CREATE_FAILED", error instanceof Error ? error.message : "Check-in create failed", 500);
  }
}
```

- [ ] **Step 9: Verify API task**

Run:

```bash
npm test -- lib/mobile/mock-recognition.test.ts
npm run lint
npm run build
```

Expected: tests pass, lint completes, build succeeds.

- [ ] **Step 10: Commit**

Run:

```bash
git add lib/mobile/mock-recognition.ts lib/mobile/mock-recognition.test.ts app/api/mobile/drafts app/api/mobile/checkins
git commit -m "feat: add async check-in draft APIs"
```

## Task 5: Recommendation Snapshots And Community Safety APIs

**Files:**
- Create: `lib/recommendations/snapshots.ts`
- Test: `lib/recommendations/snapshots.test.ts`
- Create: `app/api/mobile/discover/route.ts`
- Create: `app/api/mobile/map-heat/route.ts`
- Create: `app/api/cron/recommendations/route.ts`
- Create: `app/api/mobile/checkins/[id]/like/route.ts`
- Create: `app/api/mobile/checkins/[id]/favorite/route.ts`
- Create: `app/api/mobile/checkins/[id]/report/route.ts`
- Create: `app/api/mobile/users/[id]/block/route.ts`
- Create: `app/api/mobile/account/delete/route.ts`

**Interfaces:**
- Produces: `buildCitySnapshot(seedItems, publicCheckins)`.
- Produces: `buildPersonalProfile(checkins)`.
- Produces: endpoints for discover, heat, like, favorite, report, block, account deletion.

- [ ] **Step 1: Write snapshot tests**

Create `lib/recommendations/snapshots.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildCitySnapshot, buildPersonalProfile } from "./snapshots";

describe("recommendation snapshots", () => {
  it("keeps seed items and boosts public check-in counts", () => {
    const snapshot = buildCitySnapshot(
      [{ drinkName: "生椰拿铁", brandName: "Manner", category: "coffee", score: 1 }],
      [{ drink_name: "生椰拿铁", brand_name: "Manner", category: "coffee" }]
    );

    expect(snapshot[0]).toMatchObject({ drinkName: "生椰拿铁", score: 2 });
  });

  it("builds personal favorite categories from private and public records", () => {
    const profile = buildPersonalProfile([
      { category: "coffee", flavor_tags: ["坚果香"] },
      { category: "coffee", flavor_tags: ["奶香"] },
      { category: "tea", flavor_tags: ["回甘"] },
    ]);

    expect(profile.favoriteCategories[0]).toEqual({ category: "coffee", count: 2 });
    expect(profile.flavorTags[0].tag).toBe("坚果香");
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm test -- lib/recommendations/snapshots.test.ts
```

Expected: FAIL with module-not-found for `./snapshots`.

- [ ] **Step 3: Implement snapshot helpers**

Create `lib/recommendations/snapshots.ts`:

```ts
interface SeedItem {
  drinkName: string;
  brandName: string;
  category: string;
  score: number;
}

interface PublicCheckin {
  drink_name: string;
  brand_name: string;
  category: string;
}

interface PreferenceCheckin {
  category: string;
  flavor_tags: string[];
}

export function buildCitySnapshot(seedItems: SeedItem[], publicCheckins: PublicCheckin[]) {
  const scores = new Map<string, SeedItem>();

  for (const item of seedItems) {
    scores.set(`${item.brandName}:${item.drinkName}`, { ...item });
  }

  for (const checkin of publicCheckins) {
    const key = `${checkin.brand_name}:${checkin.drink_name}`;
    const existing = scores.get(key) ?? {
      drinkName: checkin.drink_name,
      brandName: checkin.brand_name,
      category: checkin.category,
      score: 0,
    };
    existing.score += 1;
    scores.set(key, existing);
  }

  return Array.from(scores.values()).sort((a, b) => b.score - a.score).slice(0, 10);
}

export function buildPersonalProfile(checkins: PreferenceCheckin[]) {
  const categories = new Map<string, number>();
  const tags = new Map<string, number>();

  for (const checkin of checkins) {
    categories.set(checkin.category, (categories.get(checkin.category) ?? 0) + 1);
    for (const tag of checkin.flavor_tags) tags.set(tag, (tags.get(tag) ?? 0) + 1);
  }

  return {
    favoriteCategories: Array.from(categories.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
    flavorTags: Array.from(tags.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count),
  };
}
```

- [ ] **Step 4: Implement discover and heat endpoints**

Create `app/api/mobile/discover/route.ts`:

```ts
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? "city";
    const scopeId = url.searchParams.get("scopeId") ?? "default";

    const query = supabaseAdmin
      .from("recommendation_snapshots")
      .select("*")
      .eq("type", type)
      .eq("scope_id", scopeId)
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order("generated_at", { ascending: false })
      .limit(1);

    const { data, error } = await query;
    if (error) return jsonError("DISCOVER_READ_FAILED", error.message, 500);
    return jsonOk(data?.[0] ?? null);
  } catch (error) {
    return jsonError("DISCOVER_READ_FAILED", error instanceof Error ? error.message : "Discover read failed", 500);
  }
}
```

Create `app/api/mobile/map-heat/route.ts`:

```ts
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const { data, error } = await supabaseAdmin
      .from("checkins")
      .select("city_id, region_id, visibility, moderation_status")
      .eq("user_id", userId)
      .eq("publish_status", "published");

    if (error) return jsonError("MAP_HEAT_FAILED", error.message, 500);

    const cityCounts = new Map<string, number>();
    const regionCounts = new Map<string, number>();
    for (const row of data ?? []) {
      cityCounts.set(row.city_id, (cityCounts.get(row.city_id) ?? 0) + 1);
      regionCounts.set(row.region_id, (regionCounts.get(row.region_id) ?? 0) + 1);
    }

    return jsonOk({
      cities: Array.from(cityCounts.entries()).map(([cityId, count]) => ({ cityId, count })),
      regions: Array.from(regionCounts.entries()).map(([regionId, count]) => ({ regionId, count })),
    });
  } catch (error) {
    return jsonError("MAP_HEAT_FAILED", error instanceof Error ? error.message : "Map heat failed", 500);
  }
}
```

- [ ] **Step 5: Implement community endpoints**

Create like/favorite endpoints with same toggle shape. Example for `app/api/mobile/checkins/[id]/like/route.ts`:

```ts
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    const existing = await supabaseAdmin.from("likes").select("*").eq("user_id", userId).eq("checkin_id", id).limit(1);

    if (existing.data && existing.data.length > 0) {
      const { error } = await supabaseAdmin.from("likes").delete().eq("user_id", userId).eq("checkin_id", id);
      if (error) return jsonError("LIKE_DELETE_FAILED", error.message, 500);
      return jsonOk({ liked: false });
    }

    const { error } = await supabaseAdmin.from("likes").insert({ user_id: userId, checkin_id: id });
    if (error) return jsonError("LIKE_CREATE_FAILED", error.message, 500);
    return jsonOk({ liked: true });
  } catch (error) {
    return jsonError("LIKE_FAILED", error instanceof Error ? error.message : "Like failed", 500);
  }
}
```

For `favorite`, replace table `likes` with `favorites` and response key `favorited`.

For report endpoint, create `app/api/mobile/checkins/[id]/report/route.ts`:

```ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/server";

const reportSchema = z.object({ reason: z.string().min(1), details: z.string().default("") });

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    const parsed = reportSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("INVALID_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request", 400);

    const { error } = await supabaseAdmin.from("reports").upsert({
      reporter_id: userId,
      checkin_id: id,
      reason: parsed.data.reason,
      details: parsed.data.details,
    }, { onConflict: "reporter_id,checkin_id" });

    if (error) return jsonError("REPORT_FAILED", error.message, 500);
    return jsonOk({ reported: true });
  } catch (error) {
    return jsonError("REPORT_FAILED", error instanceof Error ? error.message : "Report failed", 500);
  }
}
```

For block endpoint, insert into `blocks` with `blocker_id=userId` and `blocked_id=params.id`.

- [ ] **Step 6: Implement Cron endpoint**

Create `app/api/cron/recommendations/route.ts`:

```ts
import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/server";
import { buildCitySnapshot, buildPersonalProfile } from "@/lib/recommendations/snapshots";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return jsonError("UNAUTHORIZED", "Invalid cron secret", 401);
  }

  const seeds = await supabaseAdmin.from("seed_recommendations").select("*").eq("active", true);
  if (seeds.error) return jsonError("SEEDS_READ_FAILED", seeds.error.message, 500);

  const publicCheckins = await supabaseAdmin
    .from("checkins")
    .select("*")
    .eq("visibility", "public")
    .eq("publish_status", "published")
    .eq("moderation_status", "visible");
  if (publicCheckins.error) return jsonError("CHECKINS_READ_FAILED", publicCheckins.error.message, 500);

  const citySeeds = (seeds.data ?? []).filter((item) => item.kind === "city");
  const byCity = new Map<string, typeof citySeeds>();
  for (const seed of citySeeds) byCity.set(seed.city_id, [...(byCity.get(seed.city_id) ?? []), seed]);

  for (const [cityId, citySeedRows] of byCity.entries()) {
    const cityCheckins = (publicCheckins.data ?? []).filter((row) => row.city_id === cityId);
    const payload = buildCitySnapshot(
      citySeedRows.map((row) => ({
        drinkName: row.drink_name,
        brandName: row.brand_name,
        category: row.category,
        score: Math.max(1, 100 - row.sort_order),
      })),
      cityCheckins
    );

    await supabaseAdmin.from("recommendation_snapshots")
      .delete()
      .eq("type", "city")
      .eq("scope_id", cityId)
      .is("user_id", null);

    await supabaseAdmin.from("recommendation_snapshots").insert({
      type: "city",
      scope_id: cityId,
      user_id: null,
      payload,
      generated_at: new Date().toISOString(),
      source_version: "v1",
    });
  }

  const users = await supabaseAdmin.from("profiles").select("id").eq("account_status", "active");
  for (const user of users.data ?? []) {
    const own = await supabaseAdmin.from("checkins").select("*").eq("user_id", user.id).eq("publish_status", "published");
    const profile = buildPersonalProfile(own.data ?? []);
    await supabaseAdmin.from("personal_preference_profiles").upsert({
      user_id: user.id,
      favorite_categories: profile.favoriteCategories,
      flavor_tags: profile.flavorTags,
      recommendations: [],
      generated_at: new Date().toISOString(),
    });
  }

  return jsonOk({ generated: true });
}
```

- [ ] **Step 7: Implement account deletion endpoint**

Create `app/api/mobile/account/delete/route.ts`:

```ts
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);

    await supabaseAdmin.from("likes").delete().eq("user_id", userId);
    await supabaseAdmin.from("favorites").delete().eq("user_id", userId);
    await supabaseAdmin.from("reports").delete().eq("reporter_id", userId);
    await supabaseAdmin.from("blocks").delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
    await supabaseAdmin.from("checkins").delete().eq("user_id", userId);
    await supabaseAdmin.from("checkin_drafts").delete().eq("user_id", userId);
    await supabaseAdmin.from("personal_preference_profiles").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").update({ account_status: "deleted", display_name: "Deleted User", avatar_url: null, bio: "" }).eq("id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return jsonOk({ deleted: true });
  } catch (error) {
    return jsonError("ACCOUNT_DELETE_FAILED", error instanceof Error ? error.message : "Account delete failed", 500);
  }
}
```

- [ ] **Step 8: Verify recommendation/community task**

Run:

```bash
npm test -- lib/recommendations/snapshots.test.ts
npm run lint
npm run build
```

Expected: tests pass, lint completes, build succeeds.

- [ ] **Step 9: Commit**

Run:

```bash
git add lib/recommendations app/api/mobile/discover app/api/mobile/map-heat app/api/cron/recommendations app/api/mobile/checkins app/api/mobile/users app/api/mobile/account
git commit -m "feat: add recommendations and community safety APIs"
```

## Task 6: Mobile Auth And API Service Layer

**Files:**
- Create: `mobile/src/types/app.ts`
- Create: `mobile/src/lib/supabase.ts`
- Create: `mobile/src/lib/api.ts`
- Create: `mobile/src/lib/auth.ts`
- Create: `mobile/src/lib/recommendations.ts`

**Interfaces:**
- Produces: `apiRequest<T>(path: string, options?: RequestInit): Promise<T>`
- Produces: `sendPhoneOtp(phone: string): Promise<void>`
- Produces: `verifyPhoneOtp(phone: string, token: string): Promise<void>`
- Produces: `signInWithApple(): Promise<void>`
- Produces: `deleteAccount(): Promise<void>`

- [ ] **Step 1: Add mobile domain types**

Create `mobile/src/types/app.ts`:

```ts
export type CheckInVisibility = 'public' | 'private';
export type RecognitionStatus = 'idle' | 'uploading' | 'recognizing' | 'ready' | 'failed';

export interface RecognitionSuggestion {
  category: string;
  brandName: string;
  storeName: string;
  drinkName: string;
  flavorTags: string[];
  confidence: number;
}

export interface CheckInDraft {
  id: string;
  local_client_id: string;
  image_upload_status: RecognitionStatus;
  image_url: string | null;
  recognition_status: RecognitionStatus;
  recognition_suggestions: Partial<RecognitionSuggestion>;
  user_edited_fields: string[];
  draft_payload: Record<string, unknown>;
}

export interface PublishedCheckIn {
  id: string;
  drink_name: string;
  brand_name: string;
  store_name: string;
  category: string;
  flavor_tags: string[];
  city_id: string;
  region_id: string;
  image_url: string;
  caption: string;
  visibility: CheckInVisibility;
  moderation_status: 'visible' | 'pending_review' | 'hidden';
  date: string;
}
```

- [ ] **Step 2: Add mobile Supabase client**

Create `mobile/src/lib/supabase.ts`:

```ts
import AsyncStorage from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/Config';

const secureStorage = {
  getItem: (key: string) => AsyncStorage.getItemAsync(key),
  setItem: (key: string, value: string) => AsyncStorage.setItemAsync(key, value),
  removeItem: (key: string) => AsyncStorage.deleteItemAsync(key),
};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase mobile config missing. Auth calls will fail until env is configured.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 3: Add authenticated API client**

Create `mobile/src/lib/api.ts`:

```ts
import { API_BASE } from '@/constants/Config';
import { supabase } from './supabase';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('请先登录');

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? '请求失败');
  }

  return json.data as T;
}

export async function apiFormRequest<T>(path: string, formData: FormData): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('请先登录');

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !json.success) throw new Error(json.error?.message ?? '请求失败');
  return json.data as T;
}
```

- [ ] **Step 4: Add auth service**

Create `mobile/src/lib/auth.ts`:

```ts
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './supabase';
import { apiRequest } from './api';

export async function sendPhoneOtp(phone: string) {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw new Error(error.message);
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) throw new Error(error.message);
}

export async function signInWithApple() {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) throw new Error('Apple 登录未返回身份令牌');

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) throw new Error(error.message);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function deleteAccount() {
  await apiRequest<{ deleted: boolean }>('/account/delete', { method: 'POST' });
  await supabase.auth.signOut();
}
```

- [ ] **Step 5: Add recommendation client**

Create `mobile/src/lib/recommendations.ts`:

```ts
import { apiRequest } from './api';

export interface SnapshotResponse {
  id: string;
  type: string;
  scope_id: string;
  payload: unknown;
  generated_at: string;
}

export async function fetchDiscoverSnapshot(type: 'city' | 'region' | 'season' | 'personal', scopeId: string) {
  const query = new URLSearchParams({ type, scopeId });
  return apiRequest<SnapshotResponse | null>(`/discover?${query.toString()}`);
}

export async function fetchMapHeat() {
  return apiRequest<{
    cities: { cityId: string; count: number }[];
    regions: { regionId: string; count: number }[];
  }>('/map-heat');
}
```

- [ ] **Step 6: Verify service layer**

Run:

```bash
cd mobile && npm run lint
```

Expected: lint completes.

- [ ] **Step 7: Commit**

Run:

```bash
git add mobile/src/types/app.ts mobile/src/lib
git commit -m "feat: add mobile auth and API services"
```

## Task 7: Mobile Check-In Tab With Async Drafts

**Files:**
- Create: `mobile/src/lib/drafts.ts`
- Create: `mobile/src/components/VisibilitySelector.tsx`
- Create: `mobile/src/components/RecognitionSuggestionBar.tsx`
- Create: `mobile/src/app/check-in.tsx`
- Modify: `mobile/src/app/_layout.tsx`

**Interfaces:**
- Produces: `createDraft()`, `uploadDraftImage()`, `recognizeDraft()`, `publishDraft()`.
- Produces: Check In tab that does not block while upload/recognition runs.

- [ ] **Step 1: Add draft service**

Create `mobile/src/lib/drafts.ts`:

```ts
import { apiFormRequest, apiRequest } from './api';
import type { CheckInDraft, CheckInVisibility, PublishedCheckIn } from '@/types/app';

export async function createDraft(localClientId: string) {
  return apiRequest<CheckInDraft>('/drafts', {
    method: 'POST',
    body: JSON.stringify({ localClientId, draftPayload: {} }),
  });
}

export async function updateDraft(draftId: string, draftPayload: Record<string, unknown>, userEditedFields: string[]) {
  return apiRequest<CheckInDraft>(`/drafts/${draftId}`, {
    method: 'PATCH',
    body: JSON.stringify({ draftPayload, userEditedFields }),
  });
}

export async function uploadDraftImage(draftId: string, localUri: string) {
  const filename = localUri.split('/').pop() ?? 'drink.jpg';
  const extension = filename.split('.').pop() ?? 'jpg';
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: filename,
    type: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
  } as unknown as Blob);
  return apiFormRequest<CheckInDraft>(`/drafts/${draftId}/image`, formData);
}

export async function recognizeDraft(draftId: string) {
  return apiRequest<CheckInDraft>(`/drafts/${draftId}/recognize`, { method: 'POST' });
}

export async function publishDraft(input: {
  draftId: string;
  drinkName: string;
  brandName: string;
  storeName: string;
  category: string;
  flavorTags: string[];
  cityId: string;
  regionId: string;
  imageUrl: string;
  caption: string;
  visibility: CheckInVisibility;
  aiConfidence?: number;
}) {
  return apiRequest<PublishedCheckIn>('/checkins', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
```

- [ ] **Step 2: Add visibility selector**

Create `mobile/src/components/VisibilitySelector.tsx`:

```tsx
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import type { CheckInVisibility } from '@/types/app';

interface Props {
  value: CheckInVisibility;
  onChange: (value: CheckInVisibility) => void;
}

export function VisibilitySelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {(['public', 'private'] as const).map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => onChange(item)}
          style={[styles.button, value === item && styles.active]}
        >
          <Text style={[styles.text, value === item && styles.activeText]}>
            {item === 'public' ? '公开' : '私密'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, borderWidth: 1, borderColor: '#d6d3ca', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  active: { backgroundColor: '#43664d', borderColor: '#43664d' },
  text: { color: '#57534e', fontWeight: '700' },
  activeText: { color: '#ffffff' },
});
```

- [ ] **Step 3: Add recognition suggestion bar**

Create `mobile/src/components/RecognitionSuggestionBar.tsx`:

```tsx
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import type { RecognitionSuggestion } from '@/types/app';

interface Props {
  suggestion: Partial<RecognitionSuggestion>;
  onApply: () => void;
}

export function RecognitionSuggestionBar({ suggestion, onApply }: Props) {
  if (!suggestion.drinkName && !suggestion.brandName && !suggestion.category) return null;

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.title}>识别建议已就绪</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {[suggestion.brandName, suggestion.drinkName, suggestion.category].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <TouchableOpacity onPress={onApply} style={styles.button}>
        <Text style={styles.buttonText}>应用</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 12, alignItems: 'center', borderRadius: 12, backgroundColor: '#eef3ed', padding: 12 },
  copy: { flex: 1 },
  title: { color: '#43664d', fontWeight: '800', marginBottom: 2 },
  desc: { color: '#57534e', fontSize: 12 },
  button: { backgroundColor: '#43664d', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  buttonText: { color: '#ffffff', fontWeight: '800' },
});
```

- [ ] **Step 4: Add Check In tab screen**

Create `mobile/src/app/check-in.tsx` with a form that:

- creates a draft on first image selection;
- starts upload and recognition with `void uploadThenRecognize()`;
- lets the user edit fields while async work runs;
- uses `RecognitionSuggestionBar`;
- uses `VisibilitySelector`;
- blocks publish only when image URL or required text fields are missing.

Use this state shape:

```tsx
const [draft, setDraft] = useState<CheckInDraft | null>(null);
const [drinkName, setDrinkName] = useState('');
const [brandName, setBrandName] = useState('');
const [storeName, setStoreName] = useState('');
const [category, setCategory] = useState('coffee');
const [caption, setCaption] = useState('');
const [visibility, setVisibility] = useState<CheckInVisibility>('public');
const [editedFields, setEditedFields] = useState<string[]>([]);
const [isPublishing, setIsPublishing] = useState(false);
```

Use this non-overwrite apply behavior:

```tsx
function applySuggestion(force = false) {
  const suggestion = draft?.recognition_suggestions;
  if (!suggestion) return;
  if ((force || !editedFields.includes('drinkName')) && suggestion.drinkName) setDrinkName(suggestion.drinkName);
  if ((force || !editedFields.includes('brandName')) && suggestion.brandName) setBrandName(suggestion.brandName);
  if ((force || !editedFields.includes('storeName')) && suggestion.storeName) setStoreName(suggestion.storeName);
  if ((force || !editedFields.includes('category')) && suggestion.category) setCategory(suggestion.category);
}
```

- [ ] **Step 5: Update tabs**

Modify `mobile/src/app/_layout.tsx` tabs to:

```tsx
<Tabs.Screen
  name="check-in"
  options={{
    title: '打卡',
    headerTitle: '记录这一杯',
    tabBarLabel: '打卡',
    tabBarIcon: ({ color, size, focused }) => (
      <Ionicons name={focused ? 'camera' : 'camera-outline'} size={size} color={color} />
    ),
  }}
/>
<Tabs.Screen
  name="index"
  options={{
    title: '地图',
    headerTitle: 'SipNotes 足迹地图',
    tabBarLabel: '地图',
    tabBarIcon: ({ color, size, focused }) => (
      <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={color} />
    ),
  }}
/>
```

Keep `discover` and `profile`.

- [ ] **Step 6: Verify mobile check-in task**

Run:

```bash
cd mobile && npm run lint
cd .. && npm run build
```

Expected: lint completes, Next build succeeds.

- [ ] **Step 7: Commit**

Run:

```bash
git add mobile/src/lib/drafts.ts mobile/src/components/VisibilitySelector.tsx mobile/src/components/RecognitionSuggestionBar.tsx mobile/src/app/check-in.tsx mobile/src/app/_layout.tsx
git commit -m "feat: add async mobile check-in tab"
```

## Task 8: Map, Discover, Profile Calendar, And Community UI

**Files:**
- Create: `mobile/src/lib/map.ts`
- Create: `mobile/src/components/DrinkCalendar.tsx`
- Create: `mobile/src/components/CommunityActions.tsx`
- Modify: `mobile/src/app/index.tsx`
- Modify: `mobile/src/app/discover.tsx`
- Modify: `mobile/src/app/profile.tsx`

**Interfaces:**
- Produces: city/district heat mapping for static map.
- Produces: Discover with City/Season/For You segmented control.
- Produces: Profile calendar with drink thumbnails.
- Produces: report/block/like/favorite actions on public cards.

- [ ] **Step 1: Add heat adapter**

Create `mobile/src/lib/map.ts`:

```ts
export interface HeatInput {
  id: string;
  count: number;
}

export function heatOpacity(count: number, maxCount: number) {
  if (maxCount <= 0) return 0.2;
  return Math.min(1, 0.25 + (count / maxCount) * 0.75);
}

export function indexHeat(items: HeatInput[]) {
  const max = Math.max(0, ...items.map((item) => item.count));
  return new Map(items.map((item) => [item.id, { count: item.count, opacity: heatOpacity(item.count, max) }]));
}
```

- [ ] **Step 2: Add calendar component**

Create `mobile/src/components/DrinkCalendar.tsx`:

```tsx
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import type { PublishedCheckIn } from '@/types/app';

interface Props {
  month: Date;
  checkins: PublishedCheckIn[];
  onSelectDate: (date: string) => void;
}

export function DrinkCalendar({ month, checkins, onSelectDate }: Props) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const days = new Date(year, monthIndex + 1, 0).getDate();

  return (
    <View style={styles.grid}>
      {Array.from({ length: days }, (_, index) => {
        const day = index + 1;
        const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const first = checkins.find((item) => item.date.startsWith(date));
        return (
          <TouchableOpacity key={date} style={styles.cell} onPress={() => onSelectDate(date)}>
            <Text style={styles.day}>{day}</Text>
            {first ? <Image source={{ uri: first.image_url }} style={styles.thumb} /> : <View style={styles.empty} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: '13.2%', aspectRatio: 0.72, borderRadius: 8, backgroundColor: '#ffffff', alignItems: 'center', padding: 4 },
  day: { fontSize: 11, color: '#57534e', fontWeight: '700', marginBottom: 3 },
  thumb: { width: '100%', aspectRatio: 1, borderRadius: 6 },
  empty: { width: '100%', aspectRatio: 1, borderRadius: 6, backgroundColor: '#eeeeea' },
});
```

- [ ] **Step 3: Add community action component**

Create `mobile/src/components/CommunityActions.tsx`:

```tsx
import { Alert, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '@/lib/api';

interface Props {
  checkinId: string;
  authorId?: string;
}

export function CommunityActions({ checkinId, authorId }: Props) {
  async function post(path: string, body?: unknown) {
    await apiRequest(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={() => post(`/checkins/${checkinId}/like`)}>
        <Ionicons name="heart-outline" size={20} color="#79573f" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => post(`/checkins/${checkinId}/favorite`)}>
        <Ionicons name="bookmark-outline" size={20} color="#79573f" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => post(`/checkins/${checkinId}/report`, { reason: 'inappropriate', details: '' })}>
        <Text style={styles.link}>举报</Text>
      </TouchableOpacity>
      {authorId ? (
        <TouchableOpacity
          onPress={() =>
            Alert.alert('屏蔽用户', '屏蔽后将不再看到该用户的公开内容。', [
              { text: '取消', style: 'cancel' },
              { text: '屏蔽', style: 'destructive', onPress: () => void post(`/users/${authorId}/block`) },
            ])
          }
        >
          <Text style={styles.link}>屏蔽</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  link: { color: '#79573f', fontSize: 12, fontWeight: '800' },
});
```

- [ ] **Step 4: Refactor map screen**

Modify `mobile/src/app/index.tsx` to fetch heat from `fetchMapHeat()`, call `indexHeat()`, and drive pin opacity from real counts instead of mock totals. Keep the existing static map and list layout.

Use this effect:

```tsx
const [heat, setHeat] = useState<{ cities: { cityId: string; count: number }[]; regions: { regionId: string; count: number }[] }>({ cities: [], regions: [] });

useEffect(() => {
  fetchMapHeat()
    .then(setHeat)
    .catch((error) => console.log('Failed to load map heat', error));
}, []);
```

- [ ] **Step 5: Refactor Discover screen**

Modify `mobile/src/app/discover.tsx` to keep the existing three-tab shape and replace hard-coded recommendation reads with:

```tsx
const [activeTab, setActiveTab] = useState<'city' | 'season' | 'personal'>('city');
const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null);

useEffect(() => {
  const type = activeTab === 'personal' ? 'personal' : activeTab;
  const scopeId = activeTab === 'season' ? selectedSeason.toLowerCase() : selectedCityId;
  fetchDiscoverSnapshot(type, scopeId)
    .then(setSnapshot)
    .catch((error) => console.log('Failed to load discover snapshot', error));
}, [activeTab, selectedCityId, selectedSeason]);
```

If `snapshot` is null, render seed fallback already present in `mobile/src/data.ts`.

- [ ] **Step 6: Refactor Profile screen**

Modify `mobile/src/app/profile.tsx` to fetch the user's check-ins from `/checkins`, render `DrinkCalendar`, and expose settings actions for delete account.

Use this delete flow:

```tsx
Alert.alert('删除账号', '删除后将移除你的资料、私密记录和公开卡片。此操作无法撤销。', [
  { text: '取消', style: 'cancel' },
  { text: '删除', style: 'destructive', onPress: () => void deleteAccount() },
]);
```

- [ ] **Step 7: Verify mobile surfaces**

Run:

```bash
cd mobile && npm run lint
cd .. && npm run build
```

Expected: lint completes, build succeeds.

- [ ] **Step 8: Manual simulator smoke test**

Run:

```bash
cd mobile
npm run ios
```

Expected:

- App opens with tabs: 打卡, 地图, 探索发现, 我的.
- Check In form remains usable during upload/recognition.
- Map renders static map and pins.
- Discover switches City/Season/For You.
- Profile renders calendar cells.

- [ ] **Step 9: Commit**

Run:

```bash
git add mobile/src/lib/map.ts mobile/src/components/DrinkCalendar.tsx mobile/src/components/CommunityActions.tsx mobile/src/app/index.tsx mobile/src/app/discover.tsx mobile/src/app/profile.tsx
git commit -m "feat: connect mobile map discover and profile"
```

## Task 9: End-To-End Verification And App Store Readiness Pass

**Files:**
- Create: `docs/superpowers/evidence/2026-07-09-ios-drink-app-mvp-verification.md`
- Modify: `mobile/app.json`
- Modify: `README.md` if present, or create `README.md`

**Interfaces:**
- Produces: verification evidence document.
- Produces: documented App Store readiness checklist.

- [ ] **Step 1: Verify iOS permission strings**

Run:

```bash
node -e "const app=require('./mobile/app.json'); console.log(app.expo.ios.infoPlist)"
```

Expected output includes:

```text
NSCameraUsageDescription
NSPhotoLibraryUsageDescription
NSLocationWhenInUseUsageDescription
```

- [ ] **Step 2: Verify no service role in mobile**

Run:

```bash
rg "SERVICE_ROLE|service_role|SUPABASE_SERVICE_ROLE" mobile app lib
```

Expected: matches only server-side files outside `mobile/`, and no `SUPABASE_SERVICE_ROLE_KEY` reference in `mobile/`.

- [ ] **Step 3: Run full automated checks**

Run:

```bash
npm test
npm run lint
npm run build
cd mobile && npm run lint
```

Expected: all commands pass.

- [ ] **Step 4: Create verification evidence**

Create `docs/superpowers/evidence/2026-07-09-ios-drink-app-mvp-verification.md`:

```md
# iOS Drink App MVP Verification

Date: 2026-07-09

## Automated Checks

- `npm test`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS
- `cd mobile && npm run lint`: PASS

## Manual iOS Smoke Test

- App opens with tabs: 打卡, 地图, 探索发现, 我的.
- Photo draft can be created.
- Upload/recognition status does not block field editing.
- Recognition suggestions do not overwrite edited fields.
- Public/private publish selector is visible before publish.
- Map uses city heat.
- Discover has City, Season, For You.
- Profile calendar shows month cells and drink thumbnails when data exists.
- Like, favorite, report, and block actions are reachable on public cards.
- Account deletion action is reachable from Profile.

## App Store Readiness Notes

- Camera permission copy present.
- Photo library permission copy present.
- Location permission copy present.
- UGC report and block actions present.
- Privacy policy text still needs external legal review before submission.
- Prototype seed images must be replaced with owned or commercially usable assets before submission.
```

- [ ] **Step 5: Document setup**

Create or update `README.md` with:

```md
# SipNotes

## Prototype Stack

- iOS app: Expo Router in `mobile/`
- API: Next.js routes on Vercel
- Data: Supabase Auth, Postgres, Storage

## Required Environment

Copy `.env.example` to `.env.local` for the Next.js app and configure Expo public variables for `mobile/`.

## Local Development

```bash
npm install
npm run dev
cd mobile
npm install
npm run ios
```

## Verification

```bash
npm test
npm run lint
npm run build
cd mobile && npm run lint
```
```

- [ ] **Step 6: Commit**

Run:

```bash
git add docs/superpowers/evidence/2026-07-09-ios-drink-app-mvp-verification.md README.md mobile/app.json
git commit -m "docs: add iOS MVP verification evidence"
```
