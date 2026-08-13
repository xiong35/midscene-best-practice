# 第四步：从新需求一键泛化多个 Case

这一阶段模拟真实工作中的变化：产品提交一份排行榜筛选需求，测试人员希望基于已经跑通的项目结构，一次生成多个互补的测试 Case，而不是重新录制每一条操作。

本仓库实际走了一次完整流程：

```text
产品 PRD
+ App 导航信息
+ 已跑通的基础 Case
+ 生成约束
        ↓
   独立 AI Agent
        ↓
5 个具体的排行榜筛选 Case
```

## 1. 先把需求写具体

[`requirements/04-ranking-filtering.md`](../requirements/04-ranking-filtering.md) 是一份独立的产品需求，只描述排行榜筛选功能本身：

- 支持的榜单：销量榜、降价榜、新能源榜。
- 支持的车型：轿车、SUV、MPV。
- 支持的榜单时间：当月月份、上个月月份、近半年、近一年。
- 支持的能源类型：新能源、燃油车、纯电动、插电式混动。
- 价格既可以选择页面给出的区间，也可以拖动价格区间条。
- 不同维度可以组合，同一维度只能单选，并支持恢复默认状态。
- 五个验收场景分别使用了哪些具体组合，以及每一步应该看到什么结果。

PRD 不描述如何点击，也不包含测试框架、基础 Case 或代码实现信息。它应该像产品交给测试人员的普通需求文档一样，可以独立阅读。

筛选项名称必须在 PRD 中明确。否则 AI 只能临时从页面上任选一个选项，虽然测试可能执行成功，却无法证明产品要求的真实组合是否可用。

价格是一个例外：页面提供的预设价格档位可能随版本变化，所以 PRD 只要求选择一个真实存在的非默认档位；测试先读取页面上的完整文案，再把同一个文案用于操作和断言。自定义价格同样以拖动后页面实际显示的最低价和最高价为准。

## 2. 准备生成所需的上下文

除了 PRD，还需要两类已经沉淀的信息。

### App 导航信息

[`knowledge/dongchedi-navigation.md`](../knowledge/dongchedi-navigation.md) 告诉 AI 如何抵达排行榜，以及页面上有哪些主要区域。它负责补充截图外的信息和“怎么抵达”，不负责定义测试结果。

### 已跑通的基础 Case

[`cases/03-follow-top-sales-car.ts`](../cases/03-follow-top-sales-car.ts) 只作为工程模板，提供项目里已经验证过的写法：

- `.env` 和 Android 设备连接方式。
- 将导航文档作为 `aiActContext` 的方式。
- `screenshotShrinkFactor: 2` 配置。
- 动态页面数据的读取和传递方式。
- 断言、异常处理和 `agent.destroy()` 的组织方式。

新 Case 复用这些稳定结构，但业务步骤和断言必须来自新 PRD。

## 3. 用生成提示词约束结果

[`prompts/04-generalize-ranking-filter-cases.md`](../prompts/04-generalize-ranking-filter-cases.md) 把输入、输出和质量要求说明清楚。可以直接让支持本地文件读写的 AI 编程 Agent 执行：

```text
请严格按照 prompts/04-generalize-ranking-filter-cases.md 执行，
根据 PRD、导航信息和基础 Case 重新生成排行榜筛选测试。
完成后运行 pnpm check，并汇报每个 Case 对应的验收场景、
使用的具体筛选组合和仍需真机确认的页面假设。
```

提示词中的关键约束是：

- 五个 Case 必须逐一对应 PRD 的五个验收场景。
- 榜单、车型、时间和能源使用 PRD 指定的具体名称。
- 只有 PRD 没有固定文案的价格区间才从页面动态读取。
- 每个 Case 自己启动 App、抵达排行榜并恢复默认状态。
- 每个操作之后验证具体选中状态，而不只验证“页面正常”。
- 不写坐标、固定滑动距离或普通控件的操作教程。

## 4. 本次生成的具体 Case

| Case | 真实筛选组合 | 核心验证 |
| --- | --- | --- |
| [`01-sales-sedan-fuel-preset-price.ts`](../cases/04-ranking-filtering/01-sales-sedan-fuel-preset-price.ts) | 销量榜 + 轿车 + 当月月份 + 燃油车 + 页面上的一个非默认预设价格 | 五个条件同时选中，结果列表正常展示 |
| [`02-sales-suv-hybrid.ts`](../cases/04-ranking-filtering/02-sales-suv-hybrid.ts) | 销量榜 + SUV + 上个月月份 + 插电式混动 | 四个明确条件同时选中，结果列表正常展示 |
| [`03-new-energy-suv-pure-electric-preset-price.ts`](../cases/04-ranking-filtering/03-new-energy-suv-pure-electric-preset-price.ts) | 新能源榜 + SUV + 近半年 + 纯电动 + 页面上的一个非默认预设价格 | 五个条件同时选中，结果列表正常展示 |
| [`04-price-drop-mpv-new-energy-custom-price.ts`](../cases/04-ranking-filtering/04-price-drop-mpv-new-energy-custom-price.ts) | 降价榜 + MPV + 近一年 + 新能源 + 非默认自定义价格 | 读取并验证拖动后实际显示的最低价和最高价，旧预设价格不再选中 |
| [`05-switch-and-reset.ts`](../cases/04-ranking-filtering/05-switch-and-reset.ts) | 销量榜/轿车/当月月份/燃油车/价格，切换到新能源榜后再选择 SUV/插电式混动 | 切换榜单后旧筛选全部重置，并能在新榜单中建立筛选组合 |

[`ranking-filter-helpers.ts`](../cases/04-ranking-filtering/ranking-filter-helpers.ts) 统一处理 Agent 配置、导航上下文、默认状态恢复和价格读取。这样每个 Case 只保留自己的业务操作与断言。

## 5. 为什么这次要重新生成

第一版需求只写了“单项筛选、切换、组合、重置”，没有列出支持的选项和必须覆盖的组合。独立 AI 因此生成了“任选一个类别和选项”一类通用测试。它能操作页面，但覆盖目标不明确，也难以回答某个真实组合是否可用。

补全 PRD 后，我们清空原来的生成目录，让一个独立 AI 只根据新 PRD、导航信息和基础 Case 重新生成。第二版得到上面的五个具体 Case，并通过 TypeScript 静态检查。

这次对比说明：AI 能够放大已有信息，但不能替产品补齐验收口径。想让生成结果稳定、可复核，需求至少要明确支持的枚举、组合规则、代表性场景和预期状态；页面运行时才知道的数据再交给测试动态读取。

## 6. 生成后做轻量审核

重点检查以下内容：

- 每个 Case 是否对应一个 PRD 验收场景，没有被改写成“任意选项”。
- 固定业务枚举是否直接使用 PRD 名称，动态数据是否只限于价格等运行时信息。
- 从页面读取的价格文案是否传给了后续操作和断言。
- 每个 Case 是否独立恢复初始状态，不依赖上一条测试。
- 切换榜单时是否验证旧筛选全部重置；同一榜单内组合筛选时，已有条件是否保持。
- 断言是否验证业务状态，而不只是验证页面没有报错。
- 是否没有操作需求范围外的关注、收藏等账号数据。

如果生成时发现导航信息不足，应由用户真实探索 App 后补充 `knowledge/`，再重新生成；不要让 AI 猜测页面入口或不可见内容。

## 7. 静态检查与真机验证分开

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

也可以顺序运行全部 Case；任意一个失败时会停止：

```bash
pnpm demo:ranking-filters
```

真机执行后打开 Midscene HTML 报告，检查：

- 是否按导航信息直接抵达排行榜，没有在首页无关区域探索。
- 操作和断言中的榜单、车型、时间、能源是否与对应场景一致。
- 预设价格是否来自真实页面，并在操作后保持选中。
- 自定义价格是否读取并验证了页面实际显示的最低价和最高价。
- 切换后旧选项是否取消、其他维度是否保持。
- 每次条件变化后结果列表是否正常展示。

只有实际执行成功并检查报告后，才能把对应 Case 标记为真机通过。

## 8. 以后重复这条路径

收到下一份需求时：

1. 新建一份只描述产品功能和验收标准的 `requirements/*.md`。
2. 确认导航文档包含目标页面入口和截图外的关键信息。
3. 选择最接近、已经跑通的基础 Case 作为工程模板。
4. 让 AI 一次生成多个明确、互补的 Case。
5. 人工做轻量审核并运行 `pnpm check`。
6. 在真机执行并检查报告，把新确认的页面事实补回 `knowledge/`。
7. 将跑通的新 Case 继续作为以后泛化的可靠样例。

随着 PRD、导航知识和基础 Case 持续沉淀，后续需求可以复用的上下文会越来越完整。
