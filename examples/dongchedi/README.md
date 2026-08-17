# 懂车帝示例

这个目录展示同一套方法在真实 Android App 中留下的完整产物。方法说明统一放在仓库根目录的 docs，示例目录不重复教程，只提供可以直接阅读和运行的例子。

## App 级资产

- [APP context 文档](./app-context.md)：记录页面入口、页面关系和截图外信息。
- [最小 Smoke Case](./smoke/home-to-profile.yaml)：只用于检查启动、点击和断言链路。
- [关注订阅基础 Case](./base-cases/subscription-tab-switch.yaml)：验证只描述功能目标时，Midscene 能否借助 Context 自动抵达关注订阅页面。
- [动态关注基础 Case](./base-cases/follow-top-sales-car.ts)：读取动态车型名称、执行关注，并跨页面验证同一车型。

## Feature 级资产

[排行榜筛选 Feature](./features/ranking-filtering/README.md)将一个需求相关的所有产物放在一起：

1. [产品需求](./features/ranking-filtering/product-requirements.md)：明确产品行为和验收场景。
2. [APP context](./app-context.md)：提供 App 级页面知识。
3. [基础 Case](./base-cases/follow-top-sales-car.ts)：提供已跑通的工程模板。
4. [生成指令](./features/ranking-filtering/generate-cases.md)：告诉 AI 输入和输出位置。
5. [生成 Case 与报告](./features/ranking-filtering/README.md)：保存生成结果与真机证据。

产品需求属于 Feature，APP context 属于整个 App。新增下一项功能时，可以复用同一份 Context 和基础 Case，只为新 Feature 增加需求、生成指令、Case 与报告。

## 建议阅读顺序

1. 阅读 [APP context 文档](./app-context.md)，理解哪些信息会被多个 Case 复用。
2. 阅读[排行榜筛选产品需求](./features/ranking-filtering/product-requirements.md)，理解产品事实如何独立于导航信息。
3. 查看[基础 Case](./base-cases/follow-top-sales-car.ts)，了解工程模板。
4. 查看[生成指令](./features/ranking-filtering/generate-cases.md)和[生成结果](./features/ranking-filtering/README.md)。

## 运行

    pnpm demo:subscription-tabs
    pnpm demo:follow-top-sales-car
    pnpm demo:ranking-filters

运行环境只需按[环境附录](../../appendix/environment.md)完成一次配置。
