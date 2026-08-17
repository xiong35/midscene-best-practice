# Midscene：用 APP context 和产品需求泛化真实测试

## 你是否遇到了这些问题

- **Case 难生产：** 新需求到来后，需要人工拆场景、补导航、抄配置和反复调整提示词；即使用 AI 生成，也缺少稳定、完整的输入。
- **生成结果质量不稳定：** 页面知识、产品规则和测试目标混在一段提示词中，AI 容易遗漏约束、自行选择测试组合或生成含糊的断言。
- **执行过程容易跑偏：** 导航、页面准备和业务测试混在一起，提示词过长；Midscene 又只能看到当前截图，容易在无关区域反复探索。
- **已有 Case 难以泛化：** 每个 Case 都重复描述页面路径和操作，新需求仍然需要重写或重新录制，无法从一条成功 Case 快速扩展覆盖面。
- **维护和排障成本高：** 页面知识散落在多个 Case 中，页面变化后需要多处修改；运行失败时也难以判断是导航信息、需求事实还是测试步骤有问题。

我们的目标是把可复用信息先沉淀下来：页面导航和截图外信息写入共享的 APP context，明确清晰的产品行为预期写入产品需求，验证过的工程写法进入基础 Case。这样，**新需求只需要提供明确的需求文档，再用一段简短指令让 AI 批量生成 Case**。

## 最佳实践

1. **建设可复用的输入，而不是反复优化单条提示词。** 把页面知识、产品事实和工程模板各自维护在稳定的信息源中。
2. **让生成 Case 变简单。** 新需求只需要补充明确的产品需求，并基于已跑通的基础 Case 用简短指令生成一批互补场景。
3. **让生成结果可以直接验证。** 每个 Case 都应有具体组合、清晰断言和独立运行能力，而不是让 AI 在执行时自由决定测什么。
4. **让执行更短、更稳定。** APP context 负责导航和截图外信息，使 Case 聚焦业务测试，减少无关探索。
5. **让结果能够持续复用。** 用真机报告定位最早偏差，将新确认的事实回写到 APP context、产品需求或基础代码，继续服务后续需求。

### 几类信息的组织和组合

| 产物 | 负责回答 | 不应该包含 |
| --- | --- | --- |
| APP context 文档 | 怎么抵达页面、页面大致有什么、截图外还有什么 | 测试目标、断言、坐标和普通控件操作教程 |
| 产品需求 | 产品支持什么、交互规则是什么、什么结果算正确 | 页面导航路径、测试代码和临时操作细节 |
| 测试 Case | 本次测试什么组合、执行什么业务动作、验证什么结果 | 重复维护导航知识、临时猜测产品规则 |

> APP context 解决“怎么抵达”，产品需求定义“什么是正确”，测试 Case 只负责“这次验证什么”。

这三类信息组合成完整工作流：

```text
人工探索 App 编写 APP context 文档
    +
明确的产品需求
    +
一条已跑通的基础 Case
    ↓
AI 泛化多个 Case
    ↓
真机运行与报告验证
```

运行失败时也按相同边界修正：没有正确抵达页面就补 APP context，误解产品行为就补产品需求，单个步骤范围过大或目标含糊就修改 Case。

## 从这里开始

核心方法只由三篇文档承载：

1. [APP context 文档：作用、边界与产出方式](./docs/01-app-context.md)
2. [把产品需求写成可泛化的测试输入](./docs/02-testable-product-requirements.md)
3. [让 AI 泛化 Case，并通过真机报告持续修正](./docs/03-generalize-and-validate-cases.md)

设备连接、模型配置和截图缩放是运行前提，统一放在[环境附录](./appendix/environment.md)供参考。

## 真实示例：AI 生成 5 个排行榜筛选 Case

基于懂车帝的示例完整保留了从输入到结果的所有产物：

- [APP context 文档](./examples/dongchedi/app-context.md)
- [明确的排行榜筛选需求](./examples/dongchedi/features/ranking-filtering/product-requirements.md)
- [已跑通的基础 Case](./examples/dongchedi/base-cases/follow-top-sales-car.ts)
- [交给 AI 的生成指令](./examples/dongchedi/features/ranking-filtering/generate-cases.md)
- [AI 生成的 Case 与真机报告](./examples/dongchedi/features/ranking-filtering/README.md)

以下报告在 Android 真机上使用 `doubao-seed-2-1-turbo` 运行，5 个 Case 均通过。

| AI 生成的 Case | 覆盖场景 | 真机结果 |
| --- | --- | --- |
| [`01-sales-sedan-fuel-preset-price.ts`](./examples/dongchedi/features/ranking-filtering/cases/01-sales-sedan-fuel-preset-price.ts) | 销量榜 + 轿车 + 燃油车 + 预设价格 | [通过，查看报告](./examples/dongchedi/features/ranking-filtering/reports/01-sales-sedan-fuel-preset-price.html) |
| [`02-sales-suv-hybrid.ts`](./examples/dongchedi/features/ranking-filtering/cases/02-sales-suv-hybrid.ts) | 销量榜 + SUV + 插电式混动 | [通过，查看报告](./examples/dongchedi/features/ranking-filtering/reports/02-sales-suv-hybrid.html) |
| [`03-new-energy-suv-pure-electric-preset-price.ts`](./examples/dongchedi/features/ranking-filtering/cases/03-new-energy-suv-pure-electric-preset-price.ts) | 新能源榜 + SUV + 纯电动 + 预设价格 | [通过，查看报告](./examples/dongchedi/features/ranking-filtering/reports/03-new-energy-suv-pure-electric-preset-price.html) |
| [`04-price-drop-mpv-new-energy-custom-price.ts`](./examples/dongchedi/features/ranking-filtering/cases/04-price-drop-mpv-new-energy-custom-price.ts) | 降价榜 + MPV + 新能源 + 自定义价格 | [通过，查看报告](./examples/dongchedi/features/ranking-filtering/reports/04-price-drop-mpv-new-energy-custom-price.html) |
| [`05-switch-and-reset.ts`](./examples/dongchedi/features/ranking-filtering/cases/05-switch-and-reset.ts) | 切换榜单后重置并重新组合筛选 | [通过，查看报告](./examples/dongchedi/features/ranking-filtering/reports/05-switch-and-reset.html) |

这些 Case 不是逐条录制出来的。AI 根据 APP context、产品需求和基础 Case 一次生成初稿，再通过真实报告定位问题，将新确认的事实回写到 APP context 或产品需求中。

## 最小运行方式

```bash
pnpm install
cp .env.example .env
pnpm check:android
pnpm demo:ranking-filters
```

基础 Case 和单个排行榜 Case 的命令见[懂车帝示例说明](./examples/dongchedi/README.md)。

## 目录结构

```text
.
├── docs/                         # 三篇可复用的方法文档
├── examples/
│   └── dongchedi/
│       ├── app-context.md        # App 级共享知识
│       ├── base-cases/           # 已跑通的工程模板
│       └── features/
│           └── ranking-filtering/
│               ├── product-requirements.md
│               ├── generate-cases.md
│               ├── cases/
│               └── reports/
├── appendix/environment.md       # 简化后的运行环境说明
├── tools/check-android.ts
├── .env.example
└── package.json
```
