# 第四步：从新需求一键泛化多个 Case

第三步中，我们手写一条真实 Case，验证了 AI 通过 `aiActContext` 提供的 APP context 文档，可以自主跑通一条复杂业务流程。第四步我们改用 AI 自动生成 Case，给出在更多、更复杂的场景下批量构建测试的最佳实践。

这一阶段模拟真实工作中的变化：产品提交一份排行榜筛选需求，测试人员希望基于已经跑通的项目结构，一次生成多个互补的测试 Case，而不是重新录制每一条操作。

本仓库实际走了一次完整流程：

```text
产品 PRD
+ APP context 文档
+ 已跑通的基础 Case
+ 生成约束
        ↓ 输入
   独立 AI Agent
        ↓ 自动生成
5 个具体的排行榜筛选 Case
```

## 1. 需求描述必须足够具体

[`product-requirements.md`](./product-requirements.md) 是一份独立的产品需求，只描述排行榜筛选功能本身：

- 支持的榜单：销量榜、降价榜、新能源榜。
- 支持的车型：轿车、SUV、MPV。
- 支持的榜单时间：上个月月份、上上个月月份、近半年、近一年。
- 支持的能源类型：新能源、燃油车、纯电动、插电式混动。
- 价格既可以选择页面给出的区间，也可以拖动价格区间条。
- 不同维度可以组合，同一维度只能单选，并支持恢复默认状态。
- 五个验收场景分别使用了哪些具体组合，以及每一步应该看到什么结果。

选项、交互、预期表现等必须在 PRD 中明确。否则 AI 只能临时从页面上任选一个选项，虽然测试可能执行成功，却无法证明产品要求的真实组合是否可用。

## 2. 准备生成所需的上下文

除了 PRD，还需要两类已经沉淀的信息。

### APP context 文档

[`knowledge/dongchedi-navigation.md`](../../knowledge/dongchedi-navigation.md) 是本项目的 APP context 文档，告诉 AI 如何抵达排行榜，以及页面上有哪些主要区域。它负责补充截图外的信息和“怎么抵达”，不负责定义测试结果。

### 已跑通的基础 Case

[`cases/03-follow-top-sales-car.ts`](../../cases/03-follow-top-sales-car.ts) 只作为工程模板，提供项目里已经验证过的写法：

- `.env` 和 Android 设备连接方式。
- 将 APP context 文档通过 `aiActContext` 提供给 Midscene 的方式。
- `screenshotShrinkFactor: 2` 配置。
- 动态页面数据的读取和传递方式。
- 断言、异常处理和 `agent.destroy()` 的组织方式。

新 Case 复用这些稳定结构，但业务步骤和断言必须来自新 PRD。

## 3. 让 AI 生成更多 Case

[`generate-ranking-filter-cases.md`](./generate-ranking-filter-cases.md) 是提示词示例，可以直接让支持本地文件读写的 AI 编程 Agent 执行。

提示词仅供参考，实测 agent 对提示词的要求不高，但对 PRD 中描述的详细交互细节要求较高。

## 4. 本次生成的具体 Case

| Case | 真实筛选组合 | 核心验证 |
| --- | --- | --- |
| [`01-sales-sedan-fuel-preset-price.ts`](../../cases/04-ranking-filtering/01-sales-sedan-fuel-preset-price.ts) | 销量榜 + 轿车 + 上上个月月份 + 燃油车 + 页面上的一个非默认预设价格 | 五个条件同时选中，结果列表正常展示 |
| [`02-sales-suv-hybrid.ts`](../../cases/04-ranking-filtering/02-sales-suv-hybrid.ts) | 销量榜 + SUV + 上个月月份 + 插电式混动 | 四个明确条件同时选中，结果列表正常展示 |
| [`03-new-energy-suv-pure-electric-preset-price.ts`](../../cases/04-ranking-filtering/03-new-energy-suv-pure-electric-preset-price.ts) | 新能源榜 + SUV + 近半年 + 纯电动 + 页面上的一个非默认预设价格 | 五个条件同时选中，结果列表正常展示 |
| [`04-price-drop-mpv-new-energy-custom-price.ts`](../../cases/04-ranking-filtering/04-price-drop-mpv-new-energy-custom-price.ts) | 降价榜 + MPV + 近一年 + 新能源 + 非默认自定义价格 | 读取并验证拖动后实际显示的完整价格区间文案，旧预设价格不再选中 |
| [`05-switch-and-reset.ts`](../../cases/04-ranking-filtering/05-switch-and-reset.ts) | 销量榜/轿车/上上个月月份/燃油车/价格，切换到新能源榜后再选择 SUV/插电式混动 | 切换榜单后旧筛选全部重置，并能在新榜单中建立筛选组合 |

[`ranking-filter-helpers.ts`](../../cases/04-ranking-filtering/ranking-filter-helpers.ts) 统一处理 Agent 配置、APP context 文档、默认状态恢复和价格读取。这样每个 Case 只保留自己的业务操作与断言。

排行榜月份使用“上个月月份”“上上个月月份”这类相对文案。公共辅助代码会在运行时把当前年月及对应的两个自然月动态加入 `aiActContext`，避免 AI 自行猜测年份或月份，也避免在 Case 中写死一个会过期的日期。

## 5. 生成后审核

重点检查以下内容：

- 每个 Case 是否对应一个 PRD 验收场景，断言是否和预期一致。
- 断言是否验证业务状态，而不只是验证页面没有报错。
- 是否覆盖了各种需验证的场景。

如果生成时发现 APP context 文档信息不足，应由用户真实探索 App 后补充 `knowledge/`，再重新生成或修改 Case；避免 AI 无端猜测页面交互或逻辑

## 6. 静态检查与真机验证分开

先运行静态检查：

```bash
pnpm check
```

它能证明生成文件语法正确、类型匹配、可以纳入当前项目，但不能证明当前 App 版本中的筛选行为正确。

可以按场景单独运行：

```bash
pnpm demo:ranking-filter:sales-sedan-fuel
pnpm demo:ranking-filter:sales-suv-hybrid
pnpm demo:ranking-filter:new-energy-suv-electric
pnpm demo:ranking-filter:price-drop-mpv-custom-price
pnpm demo:ranking-filter:switch-reset
```

也可以顺序运行全部 Case。单个 Case 失败不会阻断后续执行，全部结束后会汇总每个 Case 的结果；只要存在失败，命令最终仍返回非零退出码：

```bash
pnpm demo:ranking-filters
```

### AI 生成的 Case 跑不通怎么办

AI 生成的 Case 运行效果可能不符合预期，假阳性或者假阴性都有可能。如遇这种情况，检查 Midscene HTML 报告，找到执行从哪一个页面、哪一步开始偏离预期：

- 如果没有正确抵达目标页面，就补充 APP context 文档
- 如果 AI 误解了默认状态、筛选确认或切换重置等产品行为，就补充 PRD
- 如果单个操作范围过大或目标含糊，就拆成更短的步骤，并明确每一步完成后屏幕上应该出现的状态

确认原因后，把失败报告、当前 Case 和补充的真实信息一起交给 AI，让它只修复失败 Case 或对应的公共辅助代码，再重新运行。修复过程中确认的新事实应回写 PRD 或 APP context 文档，供后续 Case 继续复用。

## 7. 可重复这条路径

收到下一份需求时：

1. 在 `docs/` 中按“阶段编号 + 业务主题”建立资料目录，放入产品需求和生成提示词；生成的用例仍放到同编号的 `cases/` 目录。
2. 确认 APP context 文档包含目标页面入口和截图外的关键信息。
3. 选择最接近、已经跑通的基础 Case 作为工程模板。
4. 让 AI 一次生成多个明确、正交的 Case。
5. 人工做轻量审核并运行 `pnpm check`。
6. 在真机执行并检查报告，把新确认的页面事实补回 `knowledge/`。
7. 将跑通的新 Case 继续作为以后泛化的可靠样例。

随着 PRD、APP context 文档和基础 Case 持续沉淀，后续需求可以复用的上下文会越来越完整。
