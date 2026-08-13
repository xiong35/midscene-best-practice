# Midscene × 懂车帝：真实 App 测试最佳实践

这个仓库从普通用户视角演示如何使用 Midscene 测试一款已经存在的 Android App。仓库不会修改 Midscene 的执行流程，也不会依赖 App 源码、DOM 或测试专用接口。

当前完成了前四个阶段：

1. 在 macOS 上准备 Android 真机和 Midscene Studio。
2. 验证 ADB、模型配置和懂车帝安装状态。
3. 从懂车帝首页进入“我的”页面，并验证跳转结果。
4. 探索 App，沉淀可复用的导航信息。
5. 让测试用例不包含 setup 路径，仅通过 `aiActContext` 抵达目标页面。
6. 使用 YAML Case 验证“关注订阅”页面的“关注/订阅”Tab 可以往返切换。
7. 动态读取销量榜第一名车型，添加关注，并在关注列表中验证同一辆车。
8. 将明确的筛选需求、导航知识和基础 Case 交给独立 AI，一次泛化出 5 个排行榜筛选 Case。

完整操作见：

- [第一步：连接 Android 真机并运行首个 Demo](./docs/01-android-device-and-first-demo.md)
- [第二步：探索 App 并编写导航文档](./docs/02-explore-app-and-write-navigation-context.md)
- [第三步：编写真实的基础用例](./docs/03-write-real-base-case.md)
- [第四步：从新需求一键泛化多个 Case](./docs/04-generalize-new-requirement.md)

测试 Case 可以使用 YAML 或 TypeScript。两者复用相同的导航信息、提示词方法和执行环境；动态数据传递等部分能力需要 TypeScript，但不影响整体工作流和用例泛化效果。

## 快速入口

```bash
pnpm install
cp .env.example .env
pnpm check:android
pnpm demo:home-to-profile
pnpm demo:subscription-tabs
pnpm demo:follow-top-sales-car
pnpm demo:ranking-filters
```

第一次使用时不要直接运行 Demo。请先按照第一步教程完成手机 USB 调试授权、Studio 连接和模型配置。

## 当前目录

```text
.
├── docs/
│   ├── 01-android-device-and-first-demo.md
│   ├── 02-explore-app-and-write-navigation-context.md
│   ├── 03-write-real-base-case.md
│   └── 04-generalize-new-requirement.md
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
├── knowledge/
│   └── dongchedi-navigation.md
├── prompts/
│   └── 04-generalize-ranking-filter-cases.md
├── requirements/
│   └── 04-ranking-filtering.md
├── src/
│   └── check-android.ts
├── .env.example
├── package.json
└── tsconfig.json
```

后续可以继续沿用阶段四的方式，逐步扩展其他功能的需求文档和测试 Case。
