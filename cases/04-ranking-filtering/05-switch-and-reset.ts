import {
  reportCaseFailure,
  restoreRankingDefaults,
  runRankingFilterCase,
} from './ranking-filter-helpers.js';

runRankingFilterCase(
  {
    groupName: '排行榜筛选：同维度切换与重置',
    groupDescription:
      '验证榜单、车型、时间和能源类型逐维切换时的单选关系、条件保持和重置结果。',
  },
  async (agent) => {
    await agent.aiAct(
      '在排行榜中明确选择“销量榜 + 轿车 + 当月 + 燃油车”，完成后停留在排行榜页面。',
    );
    await agent.aiAssert(
      '“销量榜”“轿车”“当月”“燃油车”同时处于选中状态，并且排行榜结果列表正常展示。',
    );

    await agent.aiAct('将榜单从“销量榜”切换为“新能源榜”。');
    await agent.aiAssert(
      '“新能源榜”处于选中状态，“销量榜”已取消选中；“轿车”“当月”“燃油车”仍保持选中，并且排行榜结果列表正常展示。',
    );

    await agent.aiAct('将车型从“轿车”切换为“SUV”。');
    await agent.aiAssert(
      '“SUV”处于选中状态，“轿车”已取消选中；“新能源榜”“当月”“燃油车”仍保持选中，并且排行榜结果列表正常展示。',
    );

    await agent.aiAct('将榜单时间从“当月”切换为“上个月”。');
    await agent.aiAssert(
      '“上个月”处于选中状态，“当月”已取消选中；“新能源榜”“SUV”“燃油车”仍保持选中，并且排行榜结果列表正常展示。',
    );

    await agent.aiAct('将能源类型从“燃油车”切换为“混动”。');
    await agent.aiAssert(
      '“混动”处于选中状态，“燃油车”已取消选中；“新能源榜”“SUV”“上个月”仍保持选中，并且排行榜结果列表正常展示。',
    );

    await restoreRankingDefaults(agent);
    console.log('Case 通过：各维度切换保持单选关系，并成功恢复默认状态。');
  },
).catch(reportCaseFailure);
