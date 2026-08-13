import {
  readNonDefaultPresetPriceRange,
  reportCaseFailure,
  restoreRankingDefaults,
  runRankingFilterCase,
} from './ranking-filter-helpers.js';

runRankingFilterCase(
  {
    groupName: '排行榜筛选：切换榜单后重置筛选',
    groupDescription:
      '验证切换榜单后原筛选被重置，并能在新榜单中重新组合筛选条件。',
  },
  async (agent) => {
    await agent.aiAct(
      '在排行榜中明确选择“销量榜 + 轿车 + 上上个月月份 + 燃油车”，完成后停留在排行榜页面。',
    );
    await agent.aiAssert(
      '“销量榜”“轿车”“上上个月月份”“燃油车”同时处于选中状态，并且排行榜结果列表正常展示。',
    );

    await agent.aiAct(
      '打开价格筛选面板，让页面实际提供的预设价格区间完整显示；此时不要选择任何非默认价格区间。',
    );
    const priceRange = await readNonDefaultPresetPriceRange(agent);
    await agent.aiTap(
      `价格筛选面板中的预设价格区间“${priceRange}”。`,
    );
    await agent.aiAssert(
      `“销量榜”“轿车”“上上个月月份”“燃油车”和预设价格区间“${priceRange}”同时生效，页面展示当前条件下的排行榜结果列表。`,
    );

    await agent.aiAct('将榜单从“销量榜”切换为“新能源榜”。');
    await agent.aiAssert(
      `“新能源榜”处于选中状态，“销量榜”已取消选中；车型、榜单时间、能源类型和价格均恢复为新能源榜的默认状态，“轿车”“上上个月月份”“燃油车”和“${priceRange}”均未继续生效；排行榜结果列表正常展示。`,
    );

    await agent.aiAct('在新能源榜中选择车型“SUV”。');
    await agent.aiAssert(
      '“新能源榜”和“SUV”处于选中状态，并且排行榜结果列表正常展示。',
    );

    await agent.aiAct('在新能源榜中选择能源类型“插电式混动”。');
    await agent.aiAssert(
      '“新能源榜”“SUV”“插电式混动”同时处于选中状态，价格仍为默认状态，并且排行榜结果列表正常展示。',
    );

    await restoreRankingDefaults(agent);
    console.log('Case 通过：切换榜单后筛选重置，并成功建立新筛选组合。');
  },
).catch(reportCaseFailure);
