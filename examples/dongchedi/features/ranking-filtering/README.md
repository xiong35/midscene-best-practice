# 排行榜筛选：从产品需求泛化多个 Case

这个目录是一份完整的 Feature 示例。AI 使用 App 级 Context、明确的产品需求和已跑通的基础 Case，一次生成了 5 个排行榜筛选 Case、公共辅助代码和批量执行脚本。

## 输入

| 输入 | 文件 | 作用 |
| --- | --- | --- |
| APP context | [懂车帝 APP context](../../app-context.md) | 告诉 AI 怎样抵达排行榜，以及页面有哪些主要区域 |
| 产品需求 | [排行榜筛选产品需求](./product-requirements.md) | 明确支持的筛选项、交互规则和 5 个验收场景 |
| 基础 Case | [关注销量榜第一名车型](../../base-cases/follow-top-sales-car.ts) | 提供已经跑通的 Agent 配置、Context 注入和代码组织方式 |
| 生成指令 | [生成排行榜筛选 Case](./generate-cases.md) | 指定输入、输出目录和静态检查 |

生成指令保持很短。业务事实来自产品需求，页面入口来自 APP context，工程写法来自基础 Case，不在提示词中重复维护。

## AI 生成的结果

| Case | 真实筛选组合 | 核心验证 | 报告 |
| --- | --- | --- | --- |
| [01-sales-sedan-fuel-preset-price.ts](./cases/01-sales-sedan-fuel-preset-price.ts) | 销量榜 + 轿车 + 上上个月月份 + 燃油车 + 页面上的非默认预设价格 | 条件同时生效，价格立即回显，结果列表正常展示 | [查看](./reports/01-sales-sedan-fuel-preset-price.html) |
| [02-sales-suv-hybrid.ts](./cases/02-sales-suv-hybrid.ts) | 销量榜 + SUV + 上个月月份 + 插电式混动 | 四个条件同时生效 | [查看](./reports/02-sales-suv-hybrid.html) |
| [03-new-energy-suv-pure-electric-preset-price.ts](./cases/03-new-energy-suv-pure-electric-preset-price.ts) | 新能源榜 + SUV + 近半年 + 纯电动 + 页面上的非默认预设价格 | 条件同时生效，价格立即回显 | [查看](./reports/03-new-energy-suv-pure-electric-preset-price.html) |
| [04-price-drop-mpv-new-energy-custom-price.ts](./cases/04-price-drop-mpv-new-energy-custom-price.ts) | 降价榜 + MPV + 近一年 + 新能源 + 自定义价格 | 拖动后先读取完整区间，点击确认后再验证回显 | [查看](./reports/04-price-drop-mpv-new-energy-custom-price.html) |
| [05-switch-and-reset.ts](./cases/05-switch-and-reset.ts) | 销量榜筛选后切换新能源榜，再建立新组合 | 切换榜单后旧筛选重置，新筛选可以继续组合 | [查看](./reports/05-switch-and-reset.html) |

这些代码由 AI 生成，不是逐条手工录制。ranking-filter-helpers.ts 统一处理 Agent 配置、APP context、运行时月份、默认状态恢复和价格读取；run-all.ts 允许单个 Case 失败后继续执行，最后汇总全部结果。

## 验证结果

5 个 Case 均已在 Android 真机上使用 `doubao-seed-2-1-turbo` 执行通过。仓库内 HTML 报告保留了屏幕截图、AI 规划、操作、数据提取和断言结果，可以直接检查它是否：

- 根据 APP context 抵达排行榜。
- 按产品需求选择指定组合。
- 在正确的时机确认价格条件。
- 正确处理切换榜单后的状态重置。
- 对最终业务状态进行断言。

静态检查可以证明生成代码语法和类型正确，但不能代替真机报告。

## 运行

运行单个 Case：

    pnpm demo:ranking-filter:sales-sedan-fuel
    pnpm demo:ranking-filter:sales-suv-hybrid
    pnpm demo:ranking-filter:new-energy-suv-electric
    pnpm demo:ranking-filter:price-drop-mpv-custom-price
    pnpm demo:ranking-filter:switch-reset

运行全部 Case：

    pnpm check
    pnpm demo:ranking-filters

## 生成结果跑不通时

先从 HTML 报告找到最早偏离预期的位置，再回到正确的信息源：

- 无法抵达页面：修正 APP context。
- 误解筛选确认、默认值或切换重置：修正产品需求。
- 单个动作范围过大或目标含糊：拆短 Case 提示词。
- 新确认的稳定事实：回写 Context 或产品需求，再修复失败 Case。

完整方法见[泛化与验证指南](../../../../docs/03-generalize-and-validate-cases.md)。
