# Midscene × 懂车帝：真实 App 测试最佳实践

这个仓库从普通用户视角演示如何使用 Midscene 测试一款已经存在的 Android App。

> Midscene 是一款基于视觉的 UI 自动化 Agent：它对屏幕截图，交给视觉模型理解页面，再用自然语言指令操作真机。

整个实践由四篇文档承载，循序渐进：

- [第一步：连接 Android 真机并运行首个 Demo](./docs/01-android-device-and-first-demo.md)
  在 macOS 上准备 Android 真机与 Midscene，验证 ADB、模型配置和懂车帝安装状态，跑通首个“首页 → 我的”Case。
- [第二步：探索 App 并编写 APP context 文档](./docs/02-explore-app-and-write-navigation-context.md)
  把探索 App 得到的页面信息沉淀成可复用的 APP context 文档，让测试用例不再重复 setup 路径，仅通过 `aiActContext` 抵达目标页面；并用 YAML Case 验证“关注/订阅”Tab 往返切换。
- [第三步：编写真实的基础用例](./docs/03-write-real-base-case.md)
  动态读取销量榜第一名车型，添加关注，并在关注列表中验证同一辆车。
- [第四步：从新需求一键泛化多个 Case](./docs/04-ranking-filtering/README.md)
  把明确的筛选需求、APP context 文档和基础 Case 交给独立 AI，一次泛化出 5 个排行榜筛选 Case。

## 最终成果：AI 生成 5 个 Case，真机 5/5 通过

本仓库实践了这套方法，最终使用 AI 自动生成了一系列测试用例，并使用它们在真机上成功完成了测试验证。

整体流程为：输入[APP context 文档](./knowledge/dongchedi-navigation.md) + [明确的产品需求](./docs/04-ranking-filtering/product-requirements.md) + [已跑通的基础 Case](./cases/03-follow-top-sales-car.ts) → 交给 AI → [批量生成 5 个排行榜筛选 Case](./cases/04-ranking-filtering/README.md) → 真机运行和报告验证 → **5/5 通过**

| AI 生成的 Case | 覆盖场景 | 真机结果 |
| --- | --- | --- |
| [`01-sales-sedan-fuel-preset-price.ts`](./cases/04-ranking-filtering/01-sales-sedan-fuel-preset-price.ts) | 销量榜 + 轿车 + 燃油车 + 预设价格 | [通过，查看报告](./reports/04-ranking-filtering/01-sales-sedan-fuel-preset-price.html) |
| [`02-sales-suv-hybrid.ts`](./cases/04-ranking-filtering/02-sales-suv-hybrid.ts) | 销量榜 + SUV + 插电式混动 | [通过，查看报告](./reports/04-ranking-filtering/02-sales-suv-hybrid.html) |
| [`03-new-energy-suv-pure-electric-preset-price.ts`](./cases/04-ranking-filtering/03-new-energy-suv-pure-electric-preset-price.ts) | 新能源榜 + SUV + 纯电动 + 预设价格 | [通过，查看报告](./reports/04-ranking-filtering/03-new-energy-suv-pure-electric-preset-price.html) |
| [`04-price-drop-mpv-new-energy-custom-price.ts`](./cases/04-ranking-filtering/04-price-drop-mpv-new-energy-custom-price.ts) | 降价榜 + MPV + 新能源 + 自定义价格 | [通过，查看报告](./reports/04-ranking-filtering/04-price-drop-mpv-new-energy-custom-price.html) |
| [`05-switch-and-reset.ts`](./cases/04-ranking-filtering/05-switch-and-reset.ts) | 切换榜单后重置并重新组合筛选 | [通过，查看报告](./reports/04-ranking-filtering/05-switch-and-reset.html) |

完整的生成、审核和失败修复过程见[第四步：从新需求一键泛化多个 Case](./docs/04-ranking-filtering/README.md)。

## 快速入口

首次使用请先按[第一步](./docs/01-android-device-and-first-demo.md)完成 USB 调试授权、ADB 连接和模型配置：

准备与环境检查：

```bash
pnpm install
cp .env.example .env
pnpm check:android
```

最小 Demo：

```bash
pnpm demo:home-to-profile
pnpm demo:subscription-tabs
```

真实业务 Demo（需要在懂车帝登录测试账号，会改动账号的关注状态）：

```bash
pnpm demo:follow-top-sales-car
pnpm demo:ranking-filters
```

## 目录结构

```text
.
├── docs/
│   ├── 01-android-device-and-first-demo.md
│   ├── 02-explore-app-and-write-navigation-context.md
│   ├── 03-write-real-base-case.md
│   └── 04-ranking-filtering/
│       ├── README.md
│       ├── product-requirements.md
│       └── generate-ranking-filter-cases.md
├── cases/
│   ├── 01-home-to-profile.yaml
│   ├── 02-subscription-tab-switch.yaml
│   ├── 03-follow-top-sales-car.ts
│   └── 04-ranking-filtering/
│       ├── 01-sales-sedan-fuel-preset-price.ts
│       ├── 02-sales-suv-hybrid.ts
│       ├── 03-new-energy-suv-pure-electric-preset-price.ts
│       ├── 04-price-drop-mpv-new-energy-custom-price.ts
│       ├── 05-switch-and-reset.ts
│       ├── README.md
│       ├── ranking-filter-helpers.ts
│       └── run-all.ts
├── reports/
│   └── 04-ranking-filtering/
│       ├── 01-sales-sedan-fuel-preset-price.html
│       ├── 02-sales-suv-hybrid.html
│       ├── 03-new-energy-suv-pure-electric-preset-price.html
│       ├── 04-price-drop-mpv-new-energy-custom-price.html
│       └── 05-switch-and-reset.html
├── knowledge/
│   └── dongchedi-navigation.md
├── src/
│   └── check-android.ts
├── .env.example
├── package.json
└── tsconfig.json
```

后续可以参考阶段四的方式，逐步扩展其他功能的需求文档和测试 Case。
