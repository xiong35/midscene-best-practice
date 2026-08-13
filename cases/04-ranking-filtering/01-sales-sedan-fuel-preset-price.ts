import {
  readNonDefaultPresetPriceRange,
  reportCaseFailure,
  runRankingFilterCase,
} from './ranking-filter-helpers.js';

runRankingFilterCase(
  {
    groupName: '排行榜筛选：销量榜轿车燃油车与预设价格',
    groupDescription:
      '验证销量榜、轿车、上上个月月份、燃油车和页面实际预设价格区间可以组合生效。',
  },
  async (agent) => {
    await agent.aiAct(
      '在排行榜中选择“销量榜 + 轿车 + 上上个月月份 + 燃油车”，完成后关闭所有展开的筛选面板并停留在排行榜页面。',
    );
    await agent.aiAssert(
      '“销量榜”“轿车”“上上个月月份”“燃油车”同时处于选中状态，所有筛选面板均已关闭，页面仍停留在排行榜，并且排行榜结果列表正常展示。',
    );

    await agent.aiAct(
      '打开价格筛选面板，让页面实际提供的预设价格区间完整显示；此时不要选择任何非默认价格区间。',
    );
    const priceRange = await readNonDefaultPresetPriceRange(agent);
    await agent.aiTap(
      `价格筛选面板中的预设价格区间“${priceRange}”。`,
    );
    await agent.aiAssert(
      `“销量榜”“轿车”“上上个月月份”“燃油车”和预设价格区间“${priceRange}”已立即同时生效；筛选栏回显“${priceRange}”，页面展示当前组合条件下的排行榜结果列表。`,
    );

    console.log(
      `Case 通过：销量榜 + 轿车 + 上上个月月份 + 燃油车 + ${priceRange}。`,
    );
  },
).catch(reportCaseFailure);
