# Midscene × 懂车帝：真实 App 测试最佳实践

这个仓库从普通用户视角演示如何使用 Midscene 测试一款已经存在的 Android App。仓库不会修改 Midscene 的执行流程，也不会依赖 App 源码、DOM 或测试专用接口。

当前完成了前两个阶段：

1. 在 macOS 上准备 Android 真机和 Midscene Studio。
2. 验证 ADB、模型配置和懂车帝安装状态。
3. 从懂车帝首页进入“我的”页面，并验证跳转结果。
4. 探索 App，沉淀可复用的导航信息。
5. 让测试用例不包含 setup 路径，仅通过 `aiActContext` 抵达目标页面。
6. 使用 YAML Case 验证“关注订阅”页面的“关注/订阅”Tab 可以往返切换。

完整操作见：

- [第一步：连接 Android 真机并运行首个 Demo](./docs/01-android-device-and-first-demo.md)
- [第二步：探索 App 并编写导航文档](./docs/02-explore-app-and-write-navigation-context.md)

## 快速入口

```bash
pnpm install
cp .env.example .env
pnpm check:android
pnpm demo:home-to-profile
pnpm demo:subscription-tabs
```

第一次使用时不要直接运行 Demo。请先按照第一步教程完成手机 USB 调试授权、Studio 连接和模型配置。

## 当前目录

```text
.
├── docs/
│   ├── 01-android-device-and-first-demo.md
│   └── 02-explore-app-and-write-navigation-context.md
├── cases/
│   ├── 01-home-to-profile.yaml
│   └── 02-subscription-tab-switch.yaml
├── knowledge/
│   └── dongchedi-navigation.md
├── src/
│   └── check-android.ts
├── .env.example
├── package.json
└── tsconfig.json
```

后续阶段将继续加入：更多真实基础用例、新需求文档，以及基于已有知识泛化生成的新用例。
