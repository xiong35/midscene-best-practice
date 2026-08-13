import {
  reportCaseFailure,
  runRankingFilterCase,
} from './ranking-filter-helpers.js';

runRankingFilterCase(
  {
    groupName: '排行榜筛选：销量榜 SUV 插电式混动',
    groupDescription: '验证销量榜、SUV、上个月月份和插电式混动可以组合生效。',
  },
  async (agent) => {
    await agent.aiAct(
      '在排行榜中选择“销量榜 + SUV + 上个月月份 + 插电式混动”，完成后停留在排行榜页面。',
    );
    await agent.aiAssert(
      '“销量榜”“SUV”“上个月月份”“插电式混动”同时处于选中状态，页面仍停留在排行榜，并且展示当前组合条件下的排行榜结果列表。',
    );

    console.log('Case 通过：销量榜 + SUV + 上个月月份 + 插电式混动。');
  },
).catch(reportCaseFailure);
