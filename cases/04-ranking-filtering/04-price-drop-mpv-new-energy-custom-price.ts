import {
  readCustomPriceRange,
  reportCaseFailure,
  runRankingFilterCase,
} from './ranking-filter-helpers.js';

runRankingFilterCase(
  {
    groupName: '排行榜筛选：降价榜 MPV 新能源与自定义价格',
    groupDescription:
      '验证降价榜、MPV、近一年、新能源和非默认自定义价格区间可以组合生效。',
  },
  async (agent) => {
    await agent.aiAct(
      '在排行榜中选择“降价榜 + MPV + 近一年 + 新能源”，完成后关闭所有展开的筛选面板并停留在排行榜页面。',
    );
    await agent.aiAssert(
      '“降价榜”“MPV”“近一年”“新能源”同时处于选中状态，所有筛选面板均已关闭，页面仍停留在排行榜，并且排行榜结果列表正常展示。',
    );

    await agent.aiAct(
      '打开价格筛选面板，调整价格区间条，选择一个与页面默认范围不同的自定义最低价和最高价；完成后保持价格筛选面板打开，让页面实际选择的两个价格值保持可见。',
    );
    const { minPrice, maxPrice } = await readCustomPriceRange(agent);
    await agent.aiAssert(
      `价格筛选面板处于打开状态；“降价榜”“MPV”“近一年”“新能源”同时处于选中状态；自定义价格最低价为“${minPrice}”、最高价为“${maxPrice}”，并且该区间与默认价格范围不同；任何预设价格区间均未显示为当前选中项。`,
    );

    await agent.aiAct(
      '关闭价格筛选面板，不再修改任何筛选条件，并停留在排行榜页面。',
    );
    await agent.aiAssert(
      `“降价榜”“MPV”“近一年”“新能源”和自定义价格范围“${minPrice}”至“${maxPrice}”仍同时生效，所有筛选面板均已关闭，页面展示当前组合条件下的排行榜结果列表。`,
    );

    console.log(
      `Case 通过：降价榜 + MPV + 近一年 + 新能源 + ${minPrice} 至 ${maxPrice}。`,
    );
  },
).catch(reportCaseFailure);
