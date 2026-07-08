# Tasks: MVP: 饮品打卡 + 城市日榜 + 白边卡片

## 任务总览

| ID | 任务 | 负责人 | 依赖 | 状态 |
|----|------|--------|------|------|
| T1 | 项目初始化与依赖安装 | backend-agent | - | pending |
| T2 | Prisma 数据模型与 Seed 数据 | backend-agent | T1 | pending |
| T3 | 共享类型与设计 Token | frontend-agent | T1 | pending |
| T4 | 布局与底部导航 | frontend-agent | T3 | pending |
| T5 | 图片上传与白边卡片生成 | backend-agent | T1 | pending |
| T6 | AI 饮品类目识别服务 | backend-agent | T1 | pending |
| T7 | Cities / Brands / SeasonTips API | backend-agent | T2 | pending |
| T8 | CheckIn / Rankings API | backend-agent | T2, T5 | pending |
| T9 | 首页城市榜单页面 | frontend-agent | T4, T7, T8 | pending |
| T10 | 打卡流程页面（拍照→预览→标注→发布） | frontend-agent | T4, T5, T6, T7 | pending |
| T11 | 趋势页（季节推荐） | frontend-agent | T4, T7 | pending |
| T12 | 我的页面（饮品日历 + 统计） | frontend-agent | T4, T8 | pending |
| T13 | 集成联调与构建验证 | integration-agent | T9-T12 | pending |
| T14 | 质量门禁与交付检查 | integration-agent | T13 | pending |
| T15 | 拉取并锁定 GitHub UI 仓库 | frontend-agent | - | completed |
| T16 | 迁移 `my_PAGE` 设计 token 与导航壳 | frontend-agent | T3, T15 | pending |
| T17 | 迁移足迹地图 UI 并接入 `/api/map-checkins` | frontend-agent | T8, T15, T16 | pending |
| T18 | 迁移发现热门 UI 并接入 rankings / season tips | frontend-agent | T7, T8, T15, T16 | pending |
| T19 | 迁移个人主页 UI 并接入 checkins 统计 | frontend-agent | T8, T15, T16 | pending |
| T20 | 迁移打卡弹窗并接入上传、AI、创建打卡 | frontend-agent | T5, T6, T8, T15, T16 | pending |
| T21 | 设计并复刻登录/注册视觉入口 | frontend-agent | T16 | completed |

---

## 详细说明

### T1: 项目初始化与依赖安装

- 使用 `shadcn@latest init` 创建 Next.js 项目（Next.js 15 + React 19 + TypeScript + Tailwind CSS）
- 安装依赖：`prisma`, `@prisma/client`, `sharp`, `zod`, `lucide-react`, `@ai-sdk/openai`（或对应 SDK）
- 配置 `.env.example` 与 `.env.local`
- 配置 `.gitignore`（排除 `node_modules/`, `.env.local`, `*.db`, `public/uploads/`, `public/cards/`）
- 验证：`pnpm dev` 能正常启动

### T2: Prisma 数据模型与 Seed 数据

- 编写 `prisma/schema.prisma`（User, Category, Brand, Drink, City, CheckIn, Like, SeasonTip）
- 运行 `prisma db push`
- 创建 `prisma/seed.ts`：
  - 4 个类目：奶茶、咖啡、果茶、其他
  - 6-8 个热门品牌：喜茶、奈雪、瑞幸、星巴克、Manner、茶颜悦色、古茗、蜜雪冰城
  - 每个品牌 2-4 个热门产品
  - 10-15 个头部城市（北上广深杭成等）
  - 若干示例打卡记录（用于冷启动展示）
- 添加 seed script 到 package.json
- 验证：`pnpm db:seed` 成功

### T3: 共享类型与设计 Token

- 创建 `types/index.ts`：ApiResponse, Drink, Brand, Category, City, CheckIn, RankingItem 等
- 创建 `lib/design-tokens.ts` 或 CSS variables：颜色、字体、间距、圆角、阴影
- 确保颜色来自 `output/city-drink-uiux.md` 的 token
- 验证：无 emoji，无紫色渐变

### T4: 布局与底部导航

- 创建 `app/layout.tsx`：字体栈、全局样式、底部导航
- 创建 `components/bottom-nav.tsx`：4 个 Tab（榜单 Trophy、打卡 PlusCircle、趋势 Sparkles、我的 User）
- 当前页图标高亮 `--primary`
- 移动端适配，底部固定

### T5: 图片上传与白边卡片生成

- 实现 `app/api/upload/route.ts`：接收 multipart image，保存到 `public/uploads/`，返回 URL
- 实现 `lib/image.ts`：使用 Sharp 生成白边卡片
  - 输入：原图路径、城市名、日期、品牌/产品名
  - 输出：保存到 `public/cards/`，返回 cardUrl
  - 规格：1080px 宽，顶部 160px 留白，底部 240px（含信息条）
- 客户端压缩图片：最长边 ≤ 1080px
- 验证：上传图片后能成功生成白边卡片

### T6: AI 饮品类目识别服务

- 实现 `lib/ai.ts`：
  - 封装多模态模型调用（优先 GPT-4o-mini）
  - Prompt：判断图片属于 milk_tea / coffee / fruit_tea / other
  - 返回 `{ category, confidence, reason }`
- 实现 `app/api/ai/classify/route.ts`：接收图片或图片 URL，返回分类建议
- Fallback：置信度 < 0.6 不返回建议
- 验证：用示例图片测试分类接口

### T7: Cities / Brands / SeasonTips API

- `GET /api/cities`：城市列表
- `GET /api/cities/[code]`：城市详情
- `GET /api/brands`：品牌列表（含 drinks）
- `GET /api/brands/[id]/drinks`：品牌下饮品
- `GET /api/season-tips?month=7`：当月季节推荐
- 所有响应使用统一 ApiResponse 格式
- 验证：每个接口返回正确数据

### T8: CheckIn / Rankings API

- `POST /api/checkins`：创建打卡
  - 接收 image, cityId, drinkId, caption, aiSuggested
  - 调用图片处理生成白边卡片
  - 创建 CheckIn 记录
- `GET /api/checkins?userId=&date=`：查询用户打卡
- `DELETE /api/checkins/[id]`：删除打卡
- `POST /api/checkins/[id]/likes`：点赞
- `GET /api/rankings?city=&date=&category=`：城市日榜 Top3
  - 聚合逻辑：按 drink 分组，count(checkIns) + count(likes) * 权重
- 验证：创建打卡后榜单正确更新

### T9: 首页城市榜单页面

- `app/page.tsx`：默认展示当前城市日榜
- 城市选择器（可切换城市）
- 类目 Tab 切换（全部/奶茶/咖啡/果茶）
- Top3 卡片展示（第一名高亮）
- 加载态/空态处理
- 数据获取使用 Server Component + API fallback

### T10: 打卡流程页面

- `app/checkin/page.tsx`：
  - Step 1: 拍照/选图（文件输入）
  - Step 2: 白边卡片预览（调用 upload + image process）
  - Step 3: 饮品标注（类目、品牌、产品、城市、备注）
  - Step 4: 发布成功页
- 使用 `app/checkin/layout.tsx` 或单页 stepper
- AI 类目建议：上传图片后调用 `/api/ai/classify`
- 表单校验：必填项未填不能发布
- 发布成功后跳转到首页

### T11: 趋势页（季节推荐）

- `app/trend/page.tsx`：
  - 本月 Hero 推荐卡片
  - 地域特色横向滚动
  - 本月热门搜索标签
- 数据来自 `/api/season-tips`

### T12: 我的页面（饮品日历 + 统计）

- `app/profile/page.tsx`：
  - 本月统计：总杯数、各类目数量
  - 饮品日历：按月展示，有打卡的日期显示类目色点
  - 点击日期查看当天打卡
- 数据来自 `/api/checkins`

### T13: 集成联调与构建验证

- 联调所有 API 与页面
- 运行 `pnpm build`
- 运行 `pnpm lint`
- 运行 `pnpm type-check`
- 修复构建错误、类型错误、lint 错误
- 冒烟测试：完整走一遍「打卡 → 城市榜更新 → 日历展示」流程

### T14: 质量门禁与交付检查

- 检查代码中无 emoji、无硬编码颜色、无未使用代码
- 检查 API 路径与架构文档一致
- 检查图标全部来自 Lucide
- 更新 checklist.md 状态
- 生成运行截图/录屏证明
- 准备交付摘要

### T15: 拉取并锁定 GitHub UI 仓库

- 克隆 `https://github.com/KkOma-value/my_PAGE.git` 到 `external/my_PAGE`
- 记录锁定提交：`003733fbfdc236dd6717d16ad08b1f4fbb25f330`
- 输出迁移审计到 `output/city-drink-ui-migration-audit.md`
- 状态：已完成

### T16: 迁移 `my_PAGE` 设计 token 与导航壳

- 将 `external/my_PAGE/src/index.css` 中的 `@theme` token 合并到 `app/globals.css`
- 用 `Navbar` 视觉替换当前 `BottomNav`，保留 Next 路由能力
- 桌面端使用顶部导航，移动端使用底部导航
- 保留 Lucide React 为唯一图标库
- 验证：导航能在 `/map`、`/discover`、`/profile`、打卡弹窗之间切换

### T17: 迁移足迹地图 UI 并接入 `/api/map-checkins`

- 将 `FootprintMap` 改造为 Next client component
- `SipRecord` 数据由 `/api/map-checkins` 或 `/api/checkins` 转换得到
- 城市 pin 坐标使用静态坐标表，城市名称来自数据库
- 近期照片墙使用真实 `cardUrl || imageUrl`
- 删除动作接入 `DELETE /api/checkins/[id]`
- 验证：新增打卡后地图和照片墙刷新

### T18: 迁移发现热门 UI 并接入 rankings / season tips

- 将 `DiscoverRankings` 拆成可维护组件，接入 `/api/rankings`
- 季节推荐接入 `/api/season-tips`
- `onQuickCheckIn` 不能只写 localStorage，必须走真实打卡弹窗或创建流程
- 替换组件内所有 emoji 为 Lucide 图标
- 验证：切换城市/季节后展示真实或 API fallback 数据

### T19: 迁移个人主页 UI 并接入 checkins 统计

- 将 `UserProfileView` 改造为 Next client component
- 统计数据从 `/api/checkins` 聚合：总杯数、最爱品类、风味标签、连续打卡
- 资料编辑可先保留本地 UI 状态，不能影响主打卡数据
- 验证：发布新打卡后个人统计变化

### T20: 迁移打卡弹窗并接入上传、AI、创建打卡

- 基于 `CheckInModal` 视觉实现真实文件 input
- 上传图片调用 `/api/upload`
- AI 建议调用 `/api/ai/classify`
- 发布调用 `POST /api/checkins`
- 保留白边卡片预览与成功刷新
- 验证：完整走通「打开弹窗 → 上传 → AI 建议 → 标注 → 发布 → 地图/榜单更新」

### T21: 设计并复刻登录/注册视觉入口

- 在 Figma 新建 `SipNotes Auth Screens` 文件，创建 `Login` 与 `Register` 两个 412px 移动端画板
- 两个画板复用 `my_PAGE` 的品牌头部、温暖纸面背景、白边照片感视觉区域、输入框、主按钮和辅助链接
- 新增 `/login` 与 `/register` 页面，抽取共享 `AuthShell` / 表单组件，保持两页风格统一
- 登录表单字段：手机号或邮箱、密码；注册表单字段：昵称、手机号或邮箱、密码、确认密码
- 表单提交只做前端 UI 反馈或跳转 `/`，不调用认证 API、不写数据库、不创建会话
- 验证：Figma 截图无重叠/截断；本地页面 375/412px 与桌面容器表现正常；源码无 emoji，图标全部来自 Lucide React

---

## 交付标准

- [x] `pnpm dev` 可正常启动
- [x] `pnpm build` 零错误
- [x] `pnpm lint` 无 error
- [ ] 所有 MVP 页面可访问
- [ ] 打卡流程端到端可跑通
- [ ] 城市榜单能正确展示 Top3
- [ ] 个人日历能展示打卡记录
- [x] 源码中无 emoji
- [x] 颜色来自设计 token
- [x] 展示层采用 `external/my_PAGE` UI 基线
- [ ] 主数据不依赖 mock/localStorage
- [x] `/login` 与 `/register` 页面可访问，且不改变匿名 MVP 数据链路
