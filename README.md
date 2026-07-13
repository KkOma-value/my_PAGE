# SipNotes

SipNotes 是一款面向 iPhone 的饮品记录应用。用户拍照后可继续编辑，图片上传与饮品识别在后台异步进行；公开记录参与城市、区域和季节推荐，私密记录仅用于个人偏好与个人日历。

## 技术栈

- iOS：Expo Router + React Native，代码位于 `mobile/`
- API：Next.js App Router，部署到 Vercel
- 数据：Supabase Auth、Postgres、Storage
- 定时推荐：Vercel Cron，每日调用 `/api/cron/recommendations`

## 环境变量

服务端将 `.env.example` 复制为 `.env.local`，并配置：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
```

移动端将 `mobile/.env.example` 复制为 `mobile/.env.local`，只配置公开变量。不要把 `SUPABASE_SERVICE_ROLE_KEY` 放入 `mobile/` 或任何 `EXPO_PUBLIC_*` 变量。

## Supabase

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

迁移位于 `supabase/migrations/`。开发种子数据位于 `supabase/seed/ios_drink_seed.sql`，可在测试项目的 SQL Editor 中执行。还需在 Supabase Dashboard 启用手机号 OTP 与 Apple provider。

## 本地开发

```bash
npm install
npm run dev
```

另开终端启动 iOS：

```bash
cd mobile
npm install
npm run ios
```

Next.js 默认地址为 [http://localhost:5555](http://localhost:5555)。Expo 会在开发环境自动推断本机 API 地址，也可通过 `EXPO_PUBLIC_API_URL` 显式设置。

## 验证

```bash
npm test
npm run lint
npm run build
cd mobile
npm run lint
npx tsc --noEmit
npx expo-doctor
npx expo install --check
```

完整验证记录见 `docs/superpowers/evidence/2026-07-09-ios-drink-app-mvp-verification.md`。

## 部署

初步体验环境已上线：

- API：[https://sipnotes-api.vercel.app](https://sipnotes-api.vercel.app)
- 数据：Supabase `sipnotes`（新加坡区域）
- 客户端：在 `mobile/` 执行 `npx expo start --tunnel`，用户使用 Expo Go 扫描终端二维码

当前 Expo Go 链接依赖运行 Metro 的电脑保持在线。需要长期、固定的安装入口时，再使用 EAS Build 分发开发构建或提交 TestFlight。

App Store 发布前仍需提供可访问的隐私政策与服务条款 URL、替换原型图片/地图/图标，并完成 Apple Developer、Sign in with Apple 与短信 OTP 配置。
