# SipNotes Mobile

SipNotes 移动客户端，基于 Expo Router 与 React Native。线上 API 为 [https://sipnotes-api.vercel.app](https://sipnotes-api.vercel.app)。

## 配置

复制公开环境变量模板：

```bash
cp .env.example .env.local
```

填写 `EXPO_PUBLIC_API_URL`、`EXPO_PUBLIC_SUPABASE_URL`、`EXPO_PUBLIC_SUPABASE_ANON_KEY`。禁止放入 Supabase service-role key 或 `CRON_SECRET`。

## Expo Go 体验

```bash
npm install
npx expo start --tunnel
```

在 iPhone 安装 Expo Go，扫描终端二维码。Metro 进程与运行它的电脑必须保持在线。

## 验证

```bash
npm run lint
npx tsc --noEmit
npx expo-doctor
npx expo install --check
npx expo export --platform ios
```
