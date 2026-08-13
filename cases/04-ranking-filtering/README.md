# 排行榜筛选 Case

本目录中的测试代码由 AI 生成，不是逐条手工录制或编写的。

生成时，AI 使用了三类已有信息：

- [排行榜筛选 PRD](../../requirements/04-ranking-filtering.md)：说明要测试的筛选项、组合和预期结果。
- [App 导航信息](../../knowledge/dongchedi-navigation.md)：说明如何抵达排行榜，以及页面上有什么。
- [已有基础 Case](../03-follow-top-sales-car.ts)：提供项目的环境配置和代码写法。

实际使用的生成指令见 [04-generalize-ranking-filter-cases.md](../../prompts/04-generalize-ranking-filter-cases.md)。AI 根据 PRD 一次生成了 5 个独立 Case、公共辅助代码和批量运行脚本，生成后再由人工检查测试组合与断言是否符合需求。

当前代码已经通过 `pnpm check`。静态检查通过不代表真机业务已经通过，仍需运行 `pnpm demo:ranking-filters` 并检查 Midscene 报告。
