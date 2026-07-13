# Expo Go Initial Launch Evidence

Date: 2026-07-14

## Live Services

- Vercel API: `https://sipnotes-api.vercel.app`
- Vercel project: `kkomas-projects/sipnotes-api`
- Production deployment: `dpl_HqePWsfwGbPcgn2JMgU6Mab9ZNz3`, state `READY`
- Supabase project: `sipnotes`, ref `moucddbkmdishpyyuylt`, region `ap-southeast-1`
- Expo Go deep link at verification time: `exp://ykkwsok-anonymous-8081.exp.direct`

## Supabase Verification

- 12 application tables created; RLS enabled on all 12.
- Private `drink-images` Storage bucket created.
- Seed verified: 30 cities, 90 regions, 182 recommendation rows.
- Security advisor: no findings.
- Performance advisor: no warnings after adding missing foreign-key indexes and merging overlapping permissive policies. Empty-database unused-index notices remain informational.

## Live End-to-End Result

`scripts/verify-live.mjs` created a disposable user and verified password login, authenticated location lookup, draft creation, image upload, signed image retrieval, background recognition, check-in publication, direct Postgres/Storage persistence, account deletion, and cleanup.

```json
{"authUserCreated":true,"passwordSignIn":true,"locationCount":30,"draftCreated":true,"imageUploadedAndSigned":true,"recognitionReady":true,"checkinPublished":true,"checkinReadable":true,"postgresAndStorageVerified":true,"accountDeleted":true,"cleanupVerified":true}
```

- Unauthenticated `GET /api/mobile/locations`: `401 application/json`, confirming route availability and auth enforcement.
- Vercel runtime error query: no launch-blocking runtime errors.
- Expo manifest request: `200 application/expo+json`, 3716 bytes.
- Metro: tunnel connected, tunnel ready, target `Expo Go`.

## Local Quality Gate

- `npm test`: PASS, 24 files and 59 tests.
- `npm run lint`: PASS, 0 errors and 12 legacy Web `<img>` warnings.
- `npm run build`: PASS; Prisma Client generated before Next.js production build.
- `cd mobile && npm run lint`: PASS.
- `cd mobile && npx tsc --noEmit`: PASS.
- `cd mobile && npx expo-doctor`: PASS, 20/20 checks.
- `cd mobile && npx expo install --check`: PASS.
- `cd mobile && npx expo export --platform ios`: PASS.

## Known Limits

- Expo Go link works only while Metro tunnel and host computer remain online.
- Phone OTP provider and Apple sign-in still require external account configuration; disposable email/password auth was used for live verification.
- Recognition remains deterministic mock logic for initial workflow testing.
- App Store delivery still requires Apple Developer enrollment, legal URLs, production assets, and review preparation.
- `.env` is now ignored and removed from Git tracking. Any real credential previously committed to public history must be rotated; deleting the tracked file does not erase history.
