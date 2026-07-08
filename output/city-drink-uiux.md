# 城市饮品打卡 / 地域季节趋势推荐 — UI/UX 设计文档

> 项目代号：city-drink
> 文档类型：UIUX
> 版本：0.2
> 日期：2026-07-07

> 2026-07-08 更新：UI 展示界面以 `external/my_PAGE` 为新基线，锁定 GitHub 提交 `003733fbfdc236dd6717d16ad08b1f4fbb25f330`。本文件中 12 节为迁移后优先级最高的 UI 约束；若与旧版页面骨架冲突，以 12 节为准。

---

## 1. 设计原则

### 1.1 整体调性

- **清新、日常、有温度**：像一本打开的饮品手账，而不是数据 dashboard。
- **内容优先**：照片和白边卡片是视觉主角，UI 克制不抢戏。
- **移动优先**：核心场景发生在手机上，所有设计从 375px 宽度开始。
- **真实感**：使用真实照片、真实城市名、真实饮品数据，避免过度插画化。

### 1.2 设计禁忌（强制）

- 禁止使用 emoji 作为图标或装饰；
- 禁止紫/粉渐变主色调；
- 禁止默认系统字体直出（需声明字体栈）；
- 禁止无信息层级的卡片墙；
- 禁止使用 AI 模板化首页（巨型 hero + 渐变按钮 + emoji 装饰）。

---

## 2. 设计 Token

### 2.1 颜色系统

```css
:root {
  /* 背景 */
  --background: #FFFFFF;        /* 主背景 */
  --background-soft: #F8F7F5;   /* 卡片/区域背景 */
  --background-muted: #F0EEEA;  /* 输入框、标签背景 */

  /* 文字 */
  --foreground: #1C1917;        /* 主标题/正文 */
  --foreground-muted: #78716C;  /* 辅助说明 */
  --foreground-subtle: #A8A29E; /* 占位符、禁用 */

  /* 强调色：茶汤 / 咖啡豆 / 果茶 */
  --primary: #92400E;           /* 茶褐/咖啡棕 */
  --primary-foreground: #FFFFFF;
  --primary-soft: #FDF2E9;      /* 浅棕背景 */

  /* 类目色 */
  --category-milk-tea: #D97706; /* 奶茶 - 暖琥珀 */
  --category-coffee: #57534E;   /* 咖啡 - 石墨灰 */
  --category-fruit-tea: #059669; /* 果茶 - 草木绿 */
  --category-other: #7C3AED;    /* 其他 - 紫罗兰（仅用于类目标签，非主色） */

  /* 状态 */
  --success: #16A34A;
  --warning: #EAB308;
  --error: #DC2626;

  /* 边框 */
  --border: #E7E5E4;
  --border-strong: #D6D3D1;
}
```

### 2.2 字体系统

| Token | 字体栈 | 用途 |
|-------|--------|------|
| `--font-sans` | `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif` | 正文、标题、UI 文字 |
| `--font-mono` | `"SF Mono", "Menlo", "Consolas", monospace` | 日期、数字、统计 |

### 2.3 字号系统

| Token | 大小 | 行高 | 字重 | 用途 |
|-------|------|------|------|------|
| `text-xs` | 12px | 16px | 400 | 标签、辅助 |
| `text-sm` | 14px | 20px | 400 | 正文、按钮 |
| `text-base` | 16px | 24px | 400 | 列表项 |
| `text-lg` | 18px | 28px | 500 | 小标题 |
| `text-xl` | 20px | 30px | 600 | 页面标题 |
| `text-2xl` | 24px | 32px | 600 | 大标题/数字 |
| `text-3xl` | 30px | 38px | 700 | 城市名、TOP1 饮品 |

### 2.4 间距系统

基于 4px 网格：

| Token | 值 |
|-------|-----|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |

### 2.5 圆角与阴影

| Token | 值 | 用途 |
|-------|-----|------|
| `radius-sm` | 6px | 小标签、按钮 |
| `radius-md` | 10px | 输入框、小卡片 |
| `radius-lg` | 14px | 大卡片、弹窗 |
| `radius-xl` | 20px | 底部 Sheet、模态 |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 卡片默认 |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | 悬浮卡片 |

---

## 3. 图标系统

### 3.1 图标库

**Lucide React** 为唯一图标来源。

### 3.2 核心图标映射

| 用途 | 图标名 | 说明 |
|------|--------|------|
| 首页/榜单 | `Trophy` | 城市榜单 |
| 打卡 | `PlusCircle` 或 `Camera` | 底部主导航「打卡」 |
| 日历 | `Calendar` | 个人饮品日历 |
| 我的 | `User` | 个人中心 |
| 搜索城市 | `Search` | 城市搜索 |
| 定位 | `MapPin` | 当前城市/地点 |
| 点赞 | `Heart` | 空心，激活填充 |
| 分享 | `Share2` | 分享卡片 |
| 保存图片 | `Download` | 保存到相册 |
| 奶茶类目 | `CupSoda` | 奶茶/咖啡杯 |
| 咖啡类目 | `Coffee` | 咖啡 |
| 果茶类目 | `Cherry` / `Leaf` | 果茶/茶 |
| 其他 | `GlassWater` | 其他饮品 |
| 季节/推荐 | `Sparkles` | 季节推荐 |
| 设置 | `Settings` | 设置页 |
| 返回 | `ChevronLeft` | 返回按钮 |
| 下拉/展开 | `ChevronDown` | 展开更多 |

**禁止**：任何场景下用 emoji 替代上述图标。

---

## 4. 页面结构

### 4.1 信息架构

```
App
├── Tab 1: 城市榜（首页）
│   ├── 当前城市 Top3
│   ├── 城市切换 / 搜索
│   └── 类目筛选（全部/奶茶/咖啡/果茶）
│
├── Tab 2: 打卡（核心动作）
│   ├── 拍照 / 选图
│   ├── 白边卡片预览
│   ├── 饮品标注
│   └── 发布成功
│
├── Tab 3: 趋势
│   ├── 本月推荐
│   ├── 季节饮品
│   └── 地域特色
│
└── Tab 4: 我的
    ├── 饮品日历
    ├── 我的统计
    ├── 我的卡片
    └── 设置
```

### 4.2 底部导航

```
┌────────┬────────┬────────┬────────┐
│  榜单   │  打卡   │  趋势   │  我的   │
│ Trophy │ Plus   │ Sparkles│ User   │
└────────┴────────┴────────┴────────┘
```

- 底部导航固定 4 个入口；
- 「打卡」按钮突出显示（圆形主按钮背景 `--primary`）；
- 当前页图标填充色 `--primary`。

---

## 5. 关键页面设计

### 5.1 首页：城市榜单

**布局**：

```
┌─────────────────────────────┐
│ 茶气拍        [城市 ▼]      │  Header
├─────────────────────────────┤
│  [MapPin icon] 上海  2026.07.07         │  Location + Date
├─────────────────────────────┤
│ [全部] [奶茶] [咖啡] [果茶]  │  Category Tabs
├─────────────────────────────┤
│                             │
│   [1st] 生椰拿铁                │
│      瑞幸咖啡 · 128 杯打卡   │  Top 1 Card
│                             │
├─────────────────────────────┤
│   [2nd] 多肉葡萄                │
│      喜茶 · 96 杯打卡        │  Top 2 Card
├─────────────────────────────┤
│   [3rd] 美式                    │
│      Manner · 84 杯打卡      │  Top 3 Card
├─────────────────────────────┤
│ [查看全部城市数据 →]         │  Link
└─────────────────────────────┘
```

**说明**：
- 排名数字使用 `text-3xl` 加粗；
- Top1 卡片比其他两项更大，带 `--primary-soft` 浅棕背景；
- 每项展示：名次 + 饮品名 + 品牌 + 打卡数；
- 点击饮品进入详情页（展示近 7 天趋势、最新打卡照片）。

### 5.2 打卡流程页面

#### Step 1: 选择照片

```
┌─────────────────────────────┐
│ ← 记录一杯                   │
├─────────────────────────────┤
│                             │
│    [ 相机图标 ]              │
│     拍一张照片               │
│                             │
│    [ 图片图标 ]              │
│     从相册选择               │
│                             │
└─────────────────────────────┘
```

#### Step 2: 白边卡片预览

```
┌─────────────────────────────┐
│ ← 预览卡片                   │
├─────────────────────────────┤
│                             │
│   ┌─────────────────────┐   │
│   │                     │   │
│   │    [饮品照片]        │   │  白边卡片
│   │                     │   │
│   │   上海 · 07.07       │   │
│   │   喜茶 · 多肉葡萄    │   │
│   └─────────────────────┘   │
│                             │
│   [编辑边框样式]            │
│   [保存卡片]  [继续标注]    │
└─────────────────────────────┘
```

#### Step 3: 饮品标注

```
┌─────────────────────────────┐
│ ← 标注饮品                   │
├─────────────────────────────┤
│  类目 *                      │
│  [奶茶○] [咖啡○] [果茶○] [其他○]
│                             │
│  品牌 *                      │
│  [搜索品牌...     Search icon]       │
│  喜茶  瑞幸  星巴克  Manner  │
│                             │
│  产品 *                      │
│  [输入产品名...]             │
│  多肉葡萄  生椰拿铁  美式    │
│                             │
│  城市 *                      │
│  [MapPin icon 上海            ▼]     │
│                             │
│  备注（可选）                │
│  [今天喝的三分糖...]         │
│                             │
│     [ 发布打卡 ]             │
└─────────────────────────────┘
```

**AI 建议展示**：
- 若 AI 识别到类目，在类目选择区上方显示浅棕色提示条：
  - "AI 猜测这是 **果茶**，已为你预选"
- 提供「取消」按钮。

### 5.3 趋势页：季节推荐

```
┌─────────────────────────────┐
│ 趋势                         │
├─────────────────────────────┤
│ 7 月该吃黄皮啦 [Sparkles icon]            │  Hero Card
│ 黄皮、荔枝、薄荷正当季        │
├─────────────────────────────┤
│ 本月热门搜索                 │
│ 黄皮冰茶  荔枝气泡  生椰     │
├─────────────────────────────┤
│ 地域特色                     │
│ [广东] [云南] [浙江] [东北]  │
│                             │
│ 广东 · 黄皮冰茶              │
│ 云南 · 酸角美式              │
│ 浙江 · 龙井奶茶              │
└─────────────────────────────┘
```

**说明**：
- Hero 区使用真实饮品照片 + 深色遮罩 + 白色文字；
- 地域特色横向滑动卡片；
- 不使用渐变装饰。

### 5.4 我的：饮品日历

```
┌─────────────────────────────┐
│ 我的                         │
├─────────────────────────────┤
│ 本月已喝 24 杯               │
│ 奶茶 12 · 咖啡 8 · 果茶 4    │
├─────────────────────────────┤
│ < 2026年 7月 >               │
├────┬────┬────┬────┬────┬────┐
│ 日 │ 一 │ 二 │ 三 │ 四 │ ...│
├────┼────┼────┼────┼────┼────┤
│    │ 1  │ 2  │ 3  │ 4  │    │
│    │ [coffee] │ [milk-tea] │ [fruit-tea] │    │    │
│ ...│    │    │    │    │    │
└────┴────┴────┴────┴────┴────┘
```

**说明**：
- 日历格子里用类目色小圆点/小图标表示当天有打卡；
- 点击日期展开当天打卡详情；
- 统计数字使用 `--font-mono`。

---

## 6. 组件规范

### 6.1 按钮

| 类型 | 样式 | 用途 |
|------|------|------|
| Primary | `bg-primary text-primary-foreground rounded-md px-4 py-2` | 主行动：发布打卡、保存卡片 |
| Secondary | `bg-background-soft text-foreground rounded-md px-4 py-2 border border-border` | 次要：编辑、切换 |
| Ghost | `text-primary hover:bg-primary-soft rounded-md px-3 py-1.5` | 文字按钮：查看全部 |
| Icon Button | `p-2 rounded-full hover:bg-background-muted` | 点赞、分享、关闭 |

### 6.2 卡片

| 类型 | 样式 | 用途 |
|------|------|------|
| Ranking Card | `bg-background-soft rounded-lg p-4 shadow-sm` | 榜单项 |
| Ranking Card Top1 | `bg-primary-soft rounded-xl p-5 shadow-md border border-primary/10` | 第一名 |
| Check-in Card | `bg-white rounded-lg overflow-hidden shadow-sm` | 打卡feed |
| Tip Card | `relative rounded-xl overflow-hidden` + 图片遮罩 | 季节推荐 |

### 6.3 输入框

```css
input, select, textarea {
  @apply w-full rounded-md border border-border bg-background px-3 py-2 text-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary;
  @apply placeholder:text-foreground-subtle;
}
```

### 6.4 标签/Chip

| 类型 | 样式 |
|------|------|
| Category Active | `bg-primary text-white rounded-full px-3 py-1 text-xs font-medium` |
| Category Inactive | `bg-background-muted text-foreground-muted rounded-full px-3 py-1 text-xs` |
| City Tag | `bg-background-soft border border-border rounded-md px-2 py-1 text-xs` |

---

## 7. 交互说明

### 7.1 打卡流程交互

1. 用户点击底部「打卡」→ 弹出 Action Sheet（拍照/相册/取消）；
2. 选择图片后进入预览页，服务端生成白边卡片；
3. 用户可左右滑动切换边框样式（纯白/微纹理/无信息条）；
4. 点击「继续标注」进入标注页；
5. 必填项：类目、品牌、产品、城市；
6. 发布成功后 Toast 提示，并跳转城市榜查看自己的打卡贡献。

### 7.2 城市榜单交互

1. 首页默认定位当前城市，展示当日 Top3；
2. 点击城市名 → 进入城市搜索/选择页；
3. 类目 tab 切换时榜单即时更新；
4. 下拉刷新榜单；
5. 点击饮品进入详情页：近 7 天趋势折线图 + 最新打卡照片流。

### 7.3 分享交互

1. 打卡完成页/卡片预览页提供「保存卡片」按钮；
2. 保存成功后显示提示："卡片已保存到相册"；
3. 同时提供系统分享（Web Share API），支持微信/小红书/朋友圈。

---

## 8. 响应式策略

### 8.1 移动端（375px - 430px）

- 单列布局；
- 底部固定导航；
- 榜单卡片全宽；
- 白边卡片宽度 = 屏幕宽度 - 32px。

### 8.2 平板（768px+）

- 首页榜单改为左右分栏：左侧城市/类目选择，右侧 Top3；
- 打卡流程居中卡片，最大宽度 480px。

### 8.3 桌面（1024px+）

- 居中容器 max-width 640px；
- 两侧留白，不扩展内容宽度（保持移动体验一致性）。

---

## 9. 动效与微交互

- **页面切换**：Next.js 默认路由动画即可，不引入重型动画库；
- **点赞**：Heart 图标缩放 1.2 → 1.0，颜色从灰变红；
- **榜单加载**：骨架屏，Top1 卡片先出现；
- **发布成功**：卡片从底部滑入 + Toast；
- **日历翻页**：左右滑动切换月份，日期淡入。

所有动效使用 `transition-transform transition-colors duration-200 ease-out`，禁止过度动画。

---

## 10. 设计交付检查清单

在进入 frontend 编码前，必须确认：

- [ ] 图标库已锁定为 Lucide React；
- [ ] 颜色全部来自本 design token，无硬编码 hex；
- [ ] 页面骨架与底部导航已确定；
- [ ] 打卡流程 3 步交互已确定；
- [ ] 城市榜单数据结构已与架构文档对齐；
- [ ] 白边卡片规格（尺寸/字体/边距）已确定；
- [ ] 源码中无 emoji 字符。

---

## 11. 与 PRD/Architecture 的衔接

- PRD 中的「城市日榜」「饮品日历」「季节推荐」在本文档中定义了具体页面结构与交互；
- Architecture 中的 `/api/rankings`、`/api/checkins`、`/api/season-tips` 为本 UI 提供数据；
- Architecture 中的 Sharp 卡片生成本文档定义的白边卡片视觉样式；
- 所有组件命名与目录结构将在 Spec 阶段细化。

---

## 12. GitHub UI 迁移基线（2026-07-08）

### 12.1 UI 来源锁定

展示界面以 `external/my_PAGE` 为准。该仓库的视觉风格是 `SipNotes`：浅暖米色背景、深草木绿主色、咖啡棕辅助色、照片手账和地图足迹。迁移到当前产品时，功能与数据仍沿用「茶气拍」当前后端，展示层采用该 UI 的页面结构、交互节奏和组件质感。

品牌文字默认使用「茶气拍 / SipNotes 饮迹」并保留后续只显示其中一个品牌名的余地；未经确认不改变产品核心功能定位。

### 12.2 冻结图标库

Lucide React 仍为唯一图标库。`my_PAGE` 中已有 Lucide 使用可以迁移；所有 emoji 字符必须替换为 Lucide 图标或文本标签。

| 原 UI 用途 | 迁移图标 |
|------------|----------|
| 咖啡偏好 | `Coffee` |
| 抹茶 / 茶饮 | `Leaf` |
| 水果茶 | `Cherry` 或 `GlassWater` |
| 奶茶 | `CupSoda` |
| 地点 / 店铺 | `MapPin` 或 `Building2` |
| 季节 | `Sun` / `Leaf` / `Snowflake` |
| 数据统计 | `BarChart3` / `TrendingUp` |
| 推荐 / 发现 | `Sparkles` / `Compass` |

### 12.3 冻结字体系统

`my_PAGE` 的拉丁字体栈不可直接作为中文界面的唯一字体。迁移后采用：

```css
--font-sans: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Inter", ui-sans-serif, system-ui, sans-serif;
--font-display: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
--font-mono: "JetBrains Mono", "SF Mono", "Menlo", "Consolas", monospace;
```

### 12.4 冻结 Design Token System

迁移后的主视觉 token 以 `external/my_PAGE/src/index.css` 为准，并映射到当前 Tailwind v4 `@theme`：

```css
:root {
  --brand-primary: #43664d;
  --brand-primary-container: #84a98c;
  --brand-secondary: #79573f;
  --brand-secondary-container: #ffd1b3;
  --brand-tertiary: #685e31;
  --brand-tertiary-container: #aca06c;
  --brand-bg: #faf9f5;
  --brand-surface: #eeeeea;
  --brand-surface-low: #f4f4f0;
  --brand-text: #1a1c1a;
  --brand-text-muted: #424842;
  --brand-outline: #727972;
}
```

旧版 `--primary: #92400E` 茶褐色不再作为主品牌色，只能作为兼容或局部强调色使用。

### 12.5 冻结组件生态

| 组件类别 | 采用方案 |
|----------|----------|
| 页面框架 | Next.js App Router |
| 样式 | Tailwind CSS v4 + `@theme` token |
| 图标 | Lucide React |
| 动效 | `motion/react`，用于弹窗、卡片进入、轻量 hover |
| 表单 | 先用原生表单控件 + Tailwind，后续可再抽组件 |
| 数据 | 当前 API + Prisma，禁止用 mock/localStorage 替代主链路 |

### 12.6 冻结页面骨架

迁移后的第一屏与导航结构采用 `my_PAGE`：

```text
App Shell
├── Navbar
│   ├── Desktop: 顶部品牌 + 打卡按钮 + 发现热门 + 足迹地图 + 个人主页
│   └── Mobile: 顶部标题 + 底部四入口导航
├── /map 或首页默认视图：FootprintMap
│   ├── 足迹统计
│   ├── 中国地图城市 pin
│   ├── 近期美好记忆照片墙
│   └── 打卡详情弹窗
├── /discover：DiscoverRankings
│   ├── 城市榜单
│   ├── 地域特色
│   ├── 季节推荐
│   └── 个人推荐
├── /profile：UserProfileView
│   ├── 用户资料
│   ├── 累计饮品 / 最爱品类 / 连续打卡
│   ├── 勋章与收藏
│   └── 口味画像
└── CheckInModal
    ├── 真实照片上传
    ├── 白边卡片预览
    ├── 饮品标注
    ├── AI 类目建议
    └── 发布成功刷新地图与榜单
```

### 12.7 登录 / 注册视觉入口

登录页与注册页作为未来账号体系的视觉预留入口，不改变 MVP 的匿名用户数据链路。页面风格必须与 `my_PAGE` 迁移基线一致：

- 路由为 `/login` 与 `/register`，使用 412px 移动端画板/容器作为主要设计尺寸；
- 共享同一品牌头部、白边照片感视觉区域、输入框、主按钮、辅助链接与返回应用入口；
- 登录表单包含手机号或邮箱、密码；注册表单包含昵称、手机号或邮箱、密码、确认密码；
- 表单提交只做前端 UI 反馈或返回 `/`，不调用认证 API，不写入 Prisma，不创建会话；
- 图标只能使用 Lucide React，颜色使用 `brand-*` token，禁止 emoji 与紫/粉渐变主视觉。

### 12.8 迁移质量要求

- 迁移后的功能入口必须接入当前 API，不允许只展示静态 mock。
- 打卡弹窗必须保留当前上传、AI 类目建议、Sharp 白边卡片生成和创建打卡能力。
- 地图和榜单必须能读取数据库里的 seed/用户打卡数据。
- 登录/注册页面不得引入真实认证副作用；当前主数据链路仍使用匿名 `demo-user-001`。
- 源码扫描必须无 emoji 字符。
- 页面必须通过 `pnpm build` 和 `pnpm lint`。
