# iOS Drink App MVP Verification

Date: 2026-07-10

## Automated Checks

- `npm test`: PASS, 22 test files and 57 tests.
- `npm run lint`: PASS with 0 errors; 22 warnings remain in the legacy Web prototype.
- `npm run build`: PASS, Next.js production build generated 18 pages and API route groups.
- `cd mobile && npm run lint`: PASS with no findings.
- `cd mobile && npx tsc --noEmit`: PASS.
- `cd mobile && npx expo-doctor`: PASS, 20/20 checks.
- `cd mobile && npx expo install --check`: PASS, dependencies match Expo SDK 57.
- `cd mobile && npx expo export --platform ios`: PASS, production Hermes bundle exported.
- `pod install`: PASS with 109 CocoaPods dependencies installed.
- Signed iOS simulator `xcodebuild`: PASS with `BUILD SUCCEEDED` for iPhone 17 Pro.
- Mobile secret scan: PASS; `SUPABASE_SERVICE_ROLE_KEY` is referenced only by server code.

## iOS Simulator Smoke Test

Environment: Xcode 26.6, iOS 26.5, iPhone 17 Pro simulator.

- SipNotes launches and loads its React Native bundle.
- Login screen is nonblank and correctly framed at 1206 x 2622 pixels.
- Phone number field, OTP action, and the official Sign in with Apple button render without overlap.
- A locally signed simulator build can access SecureStore without the authorization errors produced by an intentionally unsigned compile-only build.
- Native bundle identifier is `com.sipnotes.app`.
- Sign in with Apple entitlement is present.
- Native Info.plist contains only the camera, photo library, and when-in-use location permission messages required by the current app.

## Not Yet Manually Verified

The repository's current local `.env` does not contain Supabase credentials. The following flows are implemented and covered by unit/contract checks, but still require a configured Supabase test project for manual end-to-end validation:

- Phone OTP delivery and Apple authentication callback.
- Photo upload, draft persistence, asynchronous recognition, manual correction, and publish.
- Public/private recommendation participation.
- City heat, daily snapshots, and personal calendar with real records.
- Community like, favorite, report, and block actions.
- Account deletion across Auth, Storage, and Postgres.
- Vercel Cron invocation against a deployed environment.

## Security And Dependency Review

- Official npm audit reports 2 moderate findings in Next.js's bundled PostCSS. Next 16.2.10 is the current stable release and npm offers no compatible patched version.
- Mobile audit reports 11 moderate findings in Expo CLI/config-plugin/Xcode build tooling after removing unused `@expo/ngrok`. Expo 57.0.4 is current; npm's proposed fix is a breaking downgrade and was not applied.
- No high or critical npm advisories were reported.
- Supabase RLS and explicit Data API grants are defined in the migration, but `supabase db reset` and database advisors were not run because Docker is unavailable in this workspace.

## App Store Readiness Notes

- Camera, photo library, and when-in-use location copy is present in Expo config and generated native Info.plist.
- UGC report and block actions are present; an operational moderation process is still required.
- Account deletion is reachable from Profile and has a destructive confirmation step.
- Privacy policy and terms must be legally reviewed, hosted at stable HTTPS URLs, linked from the app, and supplied in App Store Connect.
- Prototype seed images, the remote map bitmap, Expo starter icon/splash assets, and their licenses must be replaced before submission.
- The current recognizer is a deterministic mock used to validate the asynchronous workflow; production vision inference, cost controls, retries, and observability are still required.
- Apple Developer signing, Sign in with Apple provider configuration, SMS provider configuration, App Privacy answers, age rating, screenshots, and TestFlight review remain release tasks.
