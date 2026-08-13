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

    await agent.aiTap('筛选栏中的“价格”选项。');

    // AI 初版直接拖动屏幕边缘的滑块，触发了 Android 返回手势并丢失筛选。
    // 让 AI 检查报告并完成一轮修复后，改为两端都先点击内部刻度，
    // 再从安全区域短距离拖动。价格调整后还要点击底部确认按钮才能保存。
    await agent.aiTap(
      '价格区间条内部标注“40”的刻度点，不要操作最右侧的“不限”滑块。',
    );
    await agent.aiAct(
      '只拖动当前位于“40”附近的最高价滑块，将它向左移动到“30”附近；不要操作屏幕边缘，完成后保持价格面板打开。',
    );
    await agent.aiTap(
      '价格区间条内部标注“10”的刻度点，不要操作最左侧的“0”滑块。',
    );
    await agent.aiAct(
      '只拖动当前位于“10”附近的最低价滑块，将它移动到“15”附近；不要操作屏幕边缘，完成后保持价格面板打开。',
    );
    const { minPrice, maxPrice } = await readCustomPriceRange(agent);
    await agent.aiAssert(
      `价格筛选面板处于打开状态；自定义价格最低价为“${minPrice}”、最高价为“${maxPrice}”，区间在15–30万附近；任何预设价格区间均未显示为当前选中项。`,
    );

    await agent.aiTap(
      '价格筛选面板底部的黄色确认按钮，按钮文案包含“款车系符合条件”。',
    );
    await agent.aiAssert(
      `“降价榜”“MPV”“近一年”“新能源”和自定义价格范围“${minPrice}”至“${maxPrice}”同时生效；价格面板已关闭，筛选栏回显与该范围一致的价格条件，页面展示当前组合条件下的排行榜结果列表。`,
    );

    console.log(
      `Case 通过：降价榜 + MPV + 近一年 + 新能源 + ${minPrice} 至 ${maxPrice}。`,
    );
  },
).catch(reportCaseFailure);
