import 'dotenv/config';

import { readFileSync } from 'node:fs';
import { agentFromAdbDevice } from '@midscene/android';

const navigationContext = readFileSync(
  new URL('../../knowledge/dongchedi-navigation.md', import.meta.url),
  'utf8',
);

const currentMonthParts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: 'numeric',
}).formatToParts(new Date());
const currentYear = Number(
  currentMonthParts.find((part) => part.type === 'year')?.value,
);
const currentMonth = Number(
  currentMonthParts.find((part) => part.type === 'month')?.value,
);

function monthLabel(offset: number): string {
  const target = new Date(
    Date.UTC(currentYear, currentMonth - 1 + offset, 1),
  );
  return `${target.getUTCFullYear()}年${target.getUTCMonth() + 1}月`;
}

const rankingContext = `${navigationContext}

## 当前年月

- 当前是 ${monthLabel(0)}。
- “上个月月份”是 ${monthLabel(-1)}。
- “上上个月月份”是 ${monthLabel(-2)}。
- 选择榜单时间时严格使用以上对应关系，不要自行推测其他月份。`;

export type RankingFilterAgent = Awaited<
  ReturnType<typeof agentFromAdbDevice>
>;

interface RankingFilterCaseMetadata {
  groupName: string;
  groupDescription: string;
}

export async function runRankingFilterCase(
  metadata: RankingFilterCaseMetadata,
  execute: (agent: RankingFilterAgent) => Promise<void>,
): Promise<void> {
  const packageName = process.env.DONGCHEDI_PACKAGE?.trim();
  if (!packageName) {
    throw new Error('请在 .env 中设置 DONGCHEDI_PACKAGE。');
  }

  const deviceId = process.env.ANDROID_DEVICE_ID?.trim() || undefined;
  const agent = await agentFromAdbDevice(deviceId, {
    aiActContext: rankingContext,
    screenshotShrinkFactor: 2,
    groupName: metadata.groupName,
    groupDescription: metadata.groupDescription,
  });

  try {
    await agent.launch(packageName);
    await restoreRankingDefaults(agent);
    await execute(agent);
  } finally {
    await agent.destroy();
  }
}

export async function restoreRankingDefaults(
  agent: RankingFilterAgent,
): Promise<void> {
  await agent.aiAct(
    '进入排行榜页面，将榜单及筛选条件恢复到页面默认状态，完成后停留在排行榜页面。',
  );
  await agent.aiAssert(
    '当前位于排行榜页面，所有非默认筛选项均未选中，页面处于默认筛选状态，并且排行榜结果列表正常展示。',
  );
}

export async function readNonDefaultPresetPriceRange(
  agent: RankingFilterAgent,
): Promise<string> {
  const result = await agent.aiQuery<{ priceRange: string }>(
    '{priceRange: string}，从当前页面价格筛选区域中读取一个实际展示、可选择且尚未选中的非默认预设价格区间。优先选择最接近或覆盖15–30万的区间，避免筛选结果为空。priceRange 必须是页面上的完整区间文案，不能是“全部”“不限”或默认项，也不能自行编造。',
  );
  const priceRange =
    typeof result?.priceRange === 'string' ? result.priceRange.trim() : '';
  if (!priceRange) {
    throw new Error('没有读取到页面实际展示的非默认预设价格区间。');
  }
  return priceRange;
}

export interface CustomPriceRange {
  minPrice: string;
  maxPrice: string;
}

export async function readCustomPriceRange(
  agent: RankingFilterAgent,
): Promise<CustomPriceRange> {
  const result = await agent.aiQuery<CustomPriceRange>(
    '{minPrice: string, maxPrice: string}，读取当前价格区间条调整后页面实际展示的最低价和最高价。两个字段必须保留页面上的完整价格文案，不能根据区间条位置推测。',
  );
  const minPrice =
    typeof result?.minPrice === 'string' ? result.minPrice.trim() : '';
  const maxPrice =
    typeof result?.maxPrice === 'string' ? result.maxPrice.trim() : '';
  if (!minPrice || !maxPrice) {
    throw new Error('没有读取到自定义价格区间的最低价和最高价。');
  }
  if (minPrice === maxPrice) {
    throw new Error(`自定义价格区间无效：最低价和最高价均为“${minPrice}”。`);
  }
  return { minPrice, maxPrice };
}

export function reportCaseFailure(error: unknown): void {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
