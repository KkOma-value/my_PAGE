# Expo Go Initial Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put SipNotes online for initial real-user testing through Expo Go, with durable Supabase data/image storage and Vercel-hosted mobile APIs.

**Architecture:** `mobile/` runs in Expo Go and calls the deployed Next.js `/api/mobile/*` routes. Vercel keeps `SUPABASE_SERVICE_ROLE_KEY` server-side, while Supabase provides Auth, Postgres, private `drink-images` storage, and scheduled recommendation data. Expo Go receives only public Supabase configuration and the Vercel API URL.

**Tech Stack:** Expo SDK 57, React Native 0.86, Next.js 16, Supabase Auth/Postgres/Storage, Vercel Functions/Cron, Vitest.

## Global Constraints

- Primary user surface is `mobile/`; root Next.js app is API host for this launch.
- Real users access the client through Expo Go; no Apple Developer account is required.
- `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` remain server-only.
- `drink-images` remains private; authorized API responses return short-lived signed URLs.
- All exposed `public` tables keep RLS enabled.
- Existing user changes in the dirty worktree must be preserved.
- Cloud deployment happens only after local tests, lint, typecheck, and production build pass.

---

### Task 1: Release Contract And Local Verification

**Files:**
- Verify: `.env.example`
- Verify: `mobile/.env.example`
- Verify: `mobile/src/constants/config-values.ts`
- Verify: `vercel.json`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`.
- Produces: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` for Expo Go.

- [x] Run `npm test` and require exit code 0.
- [x] Run `npm run lint` and record warnings separately from errors.
- [x] Run `npm run build` and require exit code 0.
- [x] Run `cd mobile && npm run lint && npx tsc --noEmit && npx expo-doctor && npx expo install --check` and require exit code 0.
- [x] Run secret-name and git-ignore checks; confirm no service-role value is tracked or exposed through `EXPO_PUBLIC_*`.

### Task 2: Supabase Project, Schema, Storage, And Seed

**Files:**
- Apply: `supabase/migrations/20260710021319_ios_drink_app_mvp.sql`
- Apply: `supabase/seed/ios_drink_seed.sql`
- Verify: `lib/mobile/schema-contract.test.ts`
- Verify: `lib/mobile/image-storage.test.ts`

**Interfaces:**
- Produces: Supabase project URL, publishable key, service-role key, twelve app tables, private `drink-images` bucket, and 30-city seed data.

- [x] Create project `sipnotes` in region `ap-southeast-1` after Supabase cost confirmation.
- [x] Apply migration as one named migration: `ios_drink_app_mvp`.
- [x] Execute seed SQL.
- [x] Verify required tables, RLS state, bucket privacy, city count, and recommendation seed count through SQL.
- [x] Run Supabase security and performance advisors; fix launch-blocking findings before continuing.

### Task 3: Vercel API Deployment

**Files:**
- Deploy: repository root
- Verify: `vercel.json`

**Interfaces:**
- Consumes: Supabase URL, publishable key, service-role key, generated `CRON_SECRET`.
- Produces: stable HTTPS API base consumed by Expo Go.

- [x] Create or select Vercel project `sipnotes-api` under team `kkomas-projects`.
- [x] Configure all four server environment variables for production deployment.
- [x] Deploy repository root to production.
- [x] Inspect build status and runtime errors.
- [x] Call unauthenticated `/api/mobile/locations` and require `401`, proving route availability and auth enforcement.

### Task 4: Expo Go Runtime Configuration

**Files:**
- Create locally, never commit: `mobile/.env.local`
- Verify: `mobile/app.json`

**Interfaces:**
- Consumes: Vercel production URL plus Supabase public URL/key.
- Produces: Expo Go bundle configured against live backend.

- [x] Write only public values to `mobile/.env.local`.
- [x] Run `cd mobile && npx expo export --platform ios` and require exit code 0 with production variables loaded.
- [x] Start `npx expo start --tunnel --clear` and capture Expo Go QR/deep link.
- [x] Confirm Metro reports Expo Go target and no missing native-module error.

### Task 5: Live End-To-End Evidence

**Files:**
- Update: `docs/superpowers/evidence/2026-07-11-expo-go-initial-launch.md`
- Update: `README.md`
- Update: `mobile/README.md`

**Interfaces:**
- Produces: deploy URL, Expo Go launch instructions, database/storage verification results, and known limitations.

- [x] Create a disposable Supabase auth user through approved Auth flow or document provider setup blocker.
- [x] Verify authenticated location lookup, draft creation, image upload, signed image retrieval, recognition, and check-in publish.
- [x] Verify resulting Postgres rows and Storage object through Supabase queries.
- [x] Verify Vercel runtime logs contain no launch-blocking errors.
- [x] Record exact commands, URLs, pass/fail results, and any external account action still required.
