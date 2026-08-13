# Midscene × 懂车帝：真实 App 测试最佳实践

这个仓库从普通用户视角演示如何使用 Midscene 测试一款已经存在的 Android App。仓库不会修改 Midscene 的执行流程，也不会依赖 App 源码、DOM 或测试专用接口。

当前只完成第一阶段：

1. 在 macOS 上准备 Android 真机和 Midscene Studio。
2. 验证 ADB、模型配置和懂车帝安装状态。
3. 从懂车帝首页进入“我的”页面，并验证跳转结果。

完整操作见：[第一步：连接 Android 真机并运行首个 Demo](./docs/01-android-device-and-first-demo.md)。

## 快速入口

```bash
pnpm install
cp .env.example .env
pnpm check:android
pnpm demo:home-to-profile
```

第一次使用时不要直接运行最后一条命令。请先按照教程完成手机 USB 调试授权、Studio 连接和模型配置。

## 当前目录

```text
.
├── docs/
│   └── 01-android-device-and-first-demo.md
├── cases/
│   └── 01-home-to-profile.yaml
├── src/
│   └── check-android.ts
├── .env.example
├── package.json
└── tsconfig.json
```

后续阶段将在首个 YAML Case 通过后继续加入：App 导航文档、真实基础用例、新需求文档，以及基于已有知识泛化生成的新用例。
