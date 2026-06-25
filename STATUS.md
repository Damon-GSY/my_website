# Portfolio Redesign — Status Report

**Generated:** 2026-06-21  
**Branch:** `feature/gsap-redesign`  
**Base:** `main` (off commit `87ce8c5`)  
**Dev server:** `http://localhost:3000/`  
**Build:** ✅ passing (463KB / gzip 160KB)  
**Lint:** ✅ passing (exit 0)

---

## 当前 Branch 状态

### 已修改的文件 (Modified — 22 files)
| 文件 | 改动内容 |
|------|---------|
| `src/App.jsx` | 路由 + HomePage 组合（Hero/Marquee/Capabilities/Work/Journal/Contact/Footer） |
| `src/components/Hero.jsx` | 粒子场背景 + 加密 kicker + GSAP 入场动画 + 肖像 grayscale/sepia + morph CTA |
| `src/components/Navbar.jsx` | terracotta Contact 按钮（修复黑框 bug）+ glass 导航 |
| `src/components/Footer.jsx` | 大号 email CTA + 导航 + FootprintMap 真实地图 + meta bar |
| `src/components/Marquee.jsx` | GSAP 滚动条带（已瘦身：py-3 / text-xl/3xl semibold） |
| `src/components/MagneticButton.jsx` | 磁吸按钮（useReducedMotion 响应式） |
| `src/components/sections/Capabilities.jsx` | **MagicUI BentoGrid + BentoCard**（4 格 bento：AgentPipeline/Post-Training/Production Deploy/Track Record）+ FlickeringGrid 背景 |
| `src/components/sections/Work.jsx` | GSAP scroll-scrubbed 三段式揭示 + AgentPipeline 管线 + TiltCard 旗舰卡 + tape 元数据 |
| `src/components/sections/Contact.jsx` | Aurora 背景 + magnifying Dock + magnetic CTA（BorderBeam 已移除） |
| `src/components/sections/Journal.jsx` | tape 阅读时长贴纸（最新一篇倾斜，其余平直） |
| `src/index.css` | CSS 变量系统 + aurora/shimmer 动画 + --ring vars |
| `eslint.config.js` | 忽略 `_pw_shot.mjs` |
| `index.html` | FOUC dark-first 脚本 + JSON-LD |
| `package.json` | 新增：cobe / d3-geo / topojson-client / world-atlas / @radix-ui/react-icons |

### 已删除的文件 (Deleted — 3 files)
- `src/components/Preloader.jsx`
- `src/components/SmoothScroll.jsx`
-- `src/components/sections/Manifesto.jsx`

### 未跟踪的新文件 (Untracked — 19 files)
| 文件 | 用途 | 是否已集成 |
|------|------|-----------|
| `src/components/AgentPipeline.jsx` | 5 节点 agent 流程图（AnimatedBeam） | ✅ Work + Capabilities |
| `src/components/ui/particle-field.jsx` | 神经网络粒子 Canvas 背景 | ✅ Hero |
| `src/components/ui/dock.jsx` | macOS 磁吸社交 Dock | ✅ Contact |
| `src/components/ui/aurora-background.jsx` | 流动极光背景 | ✅ Contact |
| `src/components/ui/encrypted-text.jsx` | 加密乱码揭示文字 | ✅ Hero kicker |
| `src/components/ui/footprint-map.jsx` | 真实世界地图（Natural Earth + d3-geo） | ✅ Footer |
| `src/components/ui/morph-contact.jsx` | GSAP Flip morph CTA overlay | ✅ Hero |
| `src/components/ui/tilt-card.jsx` | 3D 鼠标倾斜卡片 | ✅ Work 旗舰卡 |
| `src/components/ui/animated-beam.jsx` | Aceternity 风格 SVG 光束 | ✅ AgentPipeline |
| `src/components/ui/bento-grid.tsx` | **MagicUI BentoGrid**（真组件） | ✅ Capabilities |
| `src/components/ui/flickering-grid.tsx` | **MagicUI FlickeringGrid**（真组件） | ✅ Capabilities bg |
| `src/components/ui/button.tsx` | shadcn Button（Base UI 依赖） | ⚠️ 未使用（BentoGrid 不再引用） |
| `src/components/ui/orbiting-circles.jsx` | 手建轨道图 | ❌ 已从 Capabilities 移除（被 BentoGrid 替代） |
| `src/components/ui/globe.jsx` | cobe 旋转地球 | ❌ 未集成（Codex 建议不用） |
| `src/components/ui/world-map.jsx` | 手建世界地图 | ❌ 未集成（被 footprint-map 替代） |
| `src/components/ui/tracing-beam.jsx` | 滚动光束脊柱 | ❌ 未集成 |
| `src/components/ui/lamp.jsx` | Aceternity Lamp 光柱 | ❌ 已从 App 移除 |
| `src/components/LampHeader.jsx` | Lamp 章节标题 | ❌ 已从 App 移除 |
| `src/components/OptionsShowcase.jsx` | 对比页 /__options | ❌ 临时路由（可删） |
| `src/components/SchemesShowcase.jsx` | 方案页 /__schemes | ❌ 临时路由（可删） |

---

## 需要修改的代码 (TODO)

### 🔴 紧急 — 排版/布局问题（用户明确说"完全不对"）
1. **整体排版需要 Codex 或设计师审核** — 用户多次指出排版不对，Codex 截图审查 APPROVE 但用户不满意。需要真人视觉判断具体哪里不对。
2. **Hero 右侧 `hero.png`** — 343×361 抽象占位图（grayscale+sepia 处理过）。用户说会替换成真实人像。
3. **BentoGrid 卡片高度** — `auto-rows-[20rem]` 可能不适合所有卡片内容，需要 per-card 高度控制。

### 🟡 清理 — 未使用组件
4. 删除 `src/components/OptionsShowcase.jsx` + `SchemesShowcase.jsx` + App.jsx 中对应路由。
5. 删除未集成的组件：`orbiting-circles.jsx` / `globe.jsx` / `world-map.jsx` / `tracing-beam.jsx` / `lamp.jsx` / `LampHeader.jsx` / `button.tsx`。
6. 删除 `_pw_shot.mjs`（Playwright 截图脚本，Playwright 未安装）。

### 🟡 代码质量
7. `src/components/ui/button.tsx` 导入了 `@base-ui/react/button`（未安装）——虽然没人 import 它，但文件存在 + 在 `src/` 下会被 eslint/build 扫描。删除或修复。
8. `Capabilities.jsx` 用了 `.tsx` 组件（bento-grid/flickering-grid）但项目主体是 `.jsx`——混用 TS/JSX，虽然 Vite 支持但需注意。
9. `morph-contact.jsx` — GSAP Flip 集成，需要验证在真实浏览器中是否正常工作（headless 截图无法验证交互）。

### 🟢 功能增强（Codex 创意计划 — 未实现）
10. **Agent Cockpit** — Capabilities 变成实时 agent 配置面板（参数调节 → 视觉响应）
11. **Work Objects** — 作品展示为设备框画廊（laptop/terminal/dashboard 框 + hover 预览）
12. **Personal Dashboard** — qzq.at 式活仪表盘（GitHub 实时数据 + noun-blocks）
13. **Section Color Sovereignty** — 每个章节独立色相
14. **Scroll-scrubbed Work reveals** — 已实现但可能需要调优

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + Vite 6 |
| 样式 | Tailwind CSS v4 (CSS 配置，无 config.js) |
| 动画 | GSAP 3 + ScrollTrigger + framer-motion 12 |
| 平滑滚动 | Lenis（已安装但 SmoothScroll 组件已删除） |
| 组件库 | shadcn/MagicUI (components.json + @magicui registry) |
| 图标 | lucide-react + @radix-ui/react-icons |
| 地图 | d3-geo + topojson-client + world-atlas (Natural Earth) |
| 3D | cobe (WebGL 地球，未集成) |
| 字体 | Cartograph CF (display) + Geist Variable (sans) |

## 组件清单（49 个）

### 核心页面组件 (17)
App / Layout / Navbar / Footer / ThemeToggle / Hero / Capabilities / Work / Journal / Contact / About / Projects / Blog / BlogPost / Uses / NotFound / AgentPipeline

### UI 组件 (28)
particle-field / dock / aurora-background / encrypted-text / footprint-map / morph-contact / tilt-card / animated-beam / bento-grid / flickering-grid / orbiting-circles / globe / world-map / tracing-beam / lamp / border-beam / number-ticker / spotlight-card / spotlight / scroll-progress / flip-words / shimmer-button / text-shimmer / animated-gradient-text / blur-fade / timeline / button / Marquee / MagneticButton / LampHeader / OptionsShowcase / SchemesShowcase

### 临时/未使用 (4)
OptionsShowcase / SchemesShowcase / button.tsx / _pw_shot.mjs

---

## 书签收藏使用情况

用户 Chrome 书签 "Web Design" 文件夹（25 个站点）：

| 书签 | 使用情况 |
|------|---------|
| **Magic UI** | ✅ BentoGrid + FlickeringGrid（npx shadcn add 真组件）+ Dock + Marquee + Magnetic + BorderBeam(已删) |
| **Aceternity UI** | ✅ AnimatedBeam(AgentPipeline) + Lamp(已删) + 模式参考 |
| **21st.dev** | ⚠️ 有 MCP 但未使用 |
| **60fps** | ✅ scroll-scrub + morph CTA 模式参考 |
| **mmm.page** | ✅ tape 元数据 + 倾斜卡 + per-element color 参考 |
| **qzq.at** | ✅ footprint 地图 + themed blocks 参考 |
| **Nano Design** | ✅ parameter-rail 概念参考 |
| **Once UI / Jitter / Swishy / Framer** | ✅ 调研完成，模式提取 |
| **anime.js** | ❌ 与 GSAP 重叠，不加 |
| **p5.js** | ❌ 用原生 Canvas 替代 |
| **Cult UI / HeroUI** | ❌ 已有 Aceternity/MagicUI 覆盖 |

---

## 下一步建议

1. **先让用户截图指出具体哪里"排版不对"** — Codex 截图审查和用户肉眼看到的不一致
2. **清理未使用组件**（减少 49→~25 个，减包体）
3. **替换 hero.png** 为真实人像
4. **考虑是否实现 Codex 创意计划 TOP 3**（Agent Cockpit / Work Objects / Dashboard）
5. **提交 commit** — 当前所有改动未 commit
