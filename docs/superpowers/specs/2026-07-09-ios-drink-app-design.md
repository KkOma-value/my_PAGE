# iOS Drink App Design

Date: 2026-07-09
Status: Approved design draft
Scope: `mobile/` iOS app first, with Vercel API and Supabase backend for prototype delivery.

## Goal

Build an App Store-targeted iOS drink check-in app where users record drinks by photo, get city/season/personal recommendations, see map and calendar history, and share public drink cards with basic community safety controls.

The first implementation should prove the full product loop with Supabase and Vercel before selecting mainland China production cloud services.

## Product Scope

### Primary Tabs

- Check In
- Map
- Discover
- Profile

### Check In

Users take a photo or choose one from the library, then the app creates a draft immediately. Image upload and AI-style recognition run asynchronously so the form remains editable and the user can leave the screen.

The prototype recognition layer uses mock or rule-based results. It still follows the final product shape: it suggests drink category, brand or store, drink name, and flavor tags. When recognition returns, the app fills only empty fields. If the user already edited a field, the suggestion appears as an optional value that can be applied manually.

Before publishing, the user edits details and selects visibility:

- Public: enters the shared recommendation pool and may appear to other users.
- Private: stays visible only to the user and contributes only to that user's personal recommendations.

### Map

The prototype uses a static China map with city and district heat indicators. It covers 30 seed cities. Heat depth increases with check-in counts.

Location permission is used only to auto-fill city and district. Users can manually choose or edit both fields. The prototype does not need to store precise latitude and longitude by default.

### Discover

Discover has three sections:

- City: city and district specialty recommendations.
- Season: seasonal drink recommendations.
- For You: personal recommendations based on the user's check-ins, including private records.

Discover reads precomputed recommendation snapshots. It must not trigger slow AI analysis while the user waits on the page.

### Profile

Profile contains user information, personal stats, favorites, preference profile, and a month calendar. The calendar shows drink thumbnails on days with check-ins; tapping a day opens that day's records.

### Community

Public check-ins can be browsed by other users and support likes, favorites, reports, and blocking. Comments and follow feeds are out of scope for this version.

User-generated content controls are required for App Store readiness: reporting, blocking, content hiding, and a reachable support channel.

## Recommended Approach

Use a mobile-first vertical slice:

- `mobile/` is the primary product.
- Vercel Next.js hosts API routes, scheduled jobs, and recognition/recommendation logic.
- Supabase provides Auth, Postgres, and Storage.
- The client talks to backend APIs instead of binding directly to future cloud-specific services.

This approach keeps the prototype realistic while preserving a migration path to mainland China cloud services later.

## Architecture

### iOS Client

The Expo Router app should organize product logic behind small service modules:

- Auth service: Supabase session, Apple login, phone OTP login, logout, account deletion.
- API client: typed calls to Vercel endpoints.
- Draft manager: local and remote draft state, upload progress, recognition status, retry handling.
- Recommendation client: fetches city, season, and personal snapshots.
- Map adapter: transforms city/district check-in counts into heat markers.

Screens should not directly own backend rules. They should render state from these services and dispatch user actions.

### Backend

Vercel Next.js API routes handle:

- Auth-adjacent profile setup.
- Upload coordination.
- Mock/rule-based recognition jobs.
- Check-in publishing.
- Likes, favorites, reports, and blocks.
- Recommendation snapshot reads.
- Scheduled recommendation aggregation.

`service_role` credentials stay only on the server. The mobile app must use public client credentials and authenticated user sessions.

### Supabase

Supabase is used for prototype speed:

- Auth: Sign in with Apple and phone OTP.
- Postgres: app data and recommendation snapshots.
- Storage: uploaded drink images.

Row Level Security must be enabled on all exposed tables. Private records and personal recommendation profiles must be readable only by their owner. Public records can be read by other users when moderation status allows it.

## Data Model

### `profiles`

Stores public and account-level profile data:

- `id`: Supabase auth user id.
- `display_name`
- `avatar_url`
- `bio`
- `account_status`
- timestamps

### `checkin_drafts`

Tracks unfinished check-ins and async background work:

- `id`
- `user_id`
- `local_client_id`
- `image_upload_status`
- `image_url`
- `recognition_status`
- `recognition_suggestions`
- `user_edited_fields`
- `draft_payload`
- timestamps

Drafts allow the user to leave the check-in screen during upload or recognition and return later.

### `checkins`

Published check-in records:

- `id`
- `user_id`
- `drink_name`
- `brand_name`
- `store_name`
- `category`
- `flavor_tags`
- `city_id`
- `region_id`
- `image_url`
- `caption`
- `visibility`: `public` or `private`
- `publish_status`
- `moderation_status`
- `ai_confidence`
- `ai_source`
- `date`
- timestamps

Public records can enter shared recommendations. Private records can enter only the owner's personal preference profile.

### `cities` and `city_regions`

Reference data for the 30 seed cities and their major regions:

- display name
- slug/code
- map marker coordinates
- sort order
- active status

Default 30-city seed list:

- Shanghai
- Beijing
- Guangzhou
- Shenzhen
- Chengdu
- Chongqing
- Hangzhou
- Suzhou
- Nanjing
- Wuhan
- Xi'an
- Changsha
- Tianjin
- Qingdao
- Xiamen
- Fuzhou
- Ningbo
- Zhengzhou
- Jinan
- Shenyang
- Dalian
- Harbin
- Kunming
- Guiyang
- Nanning
- Hefei
- Wuxi
- Foshan
- Dongguan
- Sanya

### `seed_recommendations`

Prototype seed content:

- 5 specialty drinks per city.
- 8 seasonal recommendations per season.
- Remote sample images for the prototype.

Seed images are acceptable for prototype work but must be replaced with owned or commercially usable images before App Store submission.

### `recommendation_snapshots`

Precomputed recommendation data read by Discover:

- `type`: city, region, season, global trend.
- `scope_id`
- `payload`
- `generated_at`
- `source_version`

### `personal_preference_profiles`

Per-user private recommendation profile:

- favorite categories
- frequent cities/regions
- flavor tags
- recent seasonal affinity
- generated recommendations
- `generated_at`

### Community Safety Tables

- `likes`
- `favorites`
- `reports`
- `blocks`
- moderation audit table or status history

Reports and blocks are user-scoped. Blocked users' public cards should not appear for the blocking user.

## Recommendation System

### Prototype Recommendation Sources

- Seed content for cold start.
- Public check-ins for shared city, region, season, and trend rankings.
- Public and private owner records for personal recommendations.

### Scheduled Jobs

Vercel Cron runs daily to generate recommendation snapshots. It aggregates public check-ins with seed recommendations and updates Discover data. Personal preference updates can run in the same job or after relevant user actions.

If a job fails, the app reads the latest successful snapshot and shows its update time. Check-in and browsing flows must keep working.

## Key Flows

### Check-In Draft Flow

1. User takes or selects a photo.
2. App creates a draft.
3. Upload starts asynchronously.
4. Mock recognition starts after image is available.
5. User can edit fields while work continues.
6. Recognition suggestions fill empty fields or appear as optional suggestions.
7. User chooses public or private.
8. User publishes.
9. Published record appears in Map, Profile calendar, and eligible recommendation inputs.

### Upload Failure

The draft remains available. The user can retry, replace the image, or continue editing non-image fields. Existing edits must not be lost.

### Recognition Failure

Publishing remains available. The user fills fields manually. The record stores `recognition_status=failed` for diagnostics.

### Public Content Moderation

Public check-ins are visible after publishing unless rules mark them risky. Risk triggers include sensitive text, suspicious images, or repeated reports. Risky content is hidden from public surfaces and enters review status, while remaining visible to its author in Profile.

### Account Deletion

The app must expose an account deletion path. Deletion removes the user's profile, sessions, private check-ins, personal preference profile, likes, favorites, reports, blocks, and public check-in cards. Aggregate recommendation snapshots may retain anonymized counts until the next scheduled regeneration, but they must not keep a link to the deleted user.

## iOS and App Store Requirements

### Permissions

The iOS app must include clear purpose strings for:

- Camera
- Photo library
- Location

Location copy should say it is used to fill city and district for check-ins and recommendations.

### User-Generated Content

Because public check-ins are UGC, the app must support:

- Reporting public content.
- Blocking users.
- Hiding risky or reported content.
- A reachable support/contact channel.

### Privacy

The product must have a privacy policy before App Store submission. It should explain:

- Photos uploaded by users.
- Location city/district usage.
- Public versus private visibility.
- Recommendation profiling.
- Account deletion.
- Third-party processors used by Supabase, Vercel, and any later AI provider.

## Testing Plan

### Functional Tests

- Apple login.
- Phone OTP login.
- Logout.
- Account deletion.
- Photo capture.
- Photo library selection.
- Upload success and failure retry.
- Recognition success, failure, and non-overwrite behavior.
- Public and private publish.
- Map city and region heat changes.
- Location auto-fill and manual override.
- Discover city, season, and personal snapshot loading.
- Profile calendar month view and day detail.
- Likes, favorites, reports, and blocks.

### Security and Data Tests

- RLS prevents reading another user's private check-ins.
- RLS prevents reading another user's personal preference profile.
- Public check-ins are hidden when moderation status requires it.
- `service_role` is not present in mobile code or public env vars.
- Storage access differs between public and private images.

### Degraded-State Tests

- API unavailable.
- Upload interrupted.
- Recognition job fails.
- Recommendation snapshot missing.
- Cron failed but previous snapshot exists.

## Acceptance Criteria

- A user can sign in with Apple or phone OTP.
- A user can create a check-in draft from a photo without blocking UI.
- A user can publish public or private check-ins.
- Public check-ins can appear in shared recommendations and community surfaces.
- Private check-ins affect only personal recommendations.
- Map heat updates at city and district levels.
- Discover reads precomputed snapshots for city, season, and personal sections.
- Profile includes calendar thumbnails and day detail.
- Public cards support likes, favorites, reports, and blocking.
- App has clear iOS permission copy and planned App Store privacy/UGC compliance.

## Out of Scope for This Version

- Comments.
- Follow feeds.
- Real visual AI provider integration.
- High-precision store-level map.
- Mainland China production cloud migration.
- Production commercial image replacement for all seed recommendations.
