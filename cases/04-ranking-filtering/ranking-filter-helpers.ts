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

// aiActContext 只会传给 aiAct，aiAssert 不会自动继承。
// 单独导出同一份动态月份信息，供涉及相对月份的断言通过 options.context 显式复用。
export const rankingTimeContext = `## 当前年月

- 当前是 ${monthLabel(0)}。
- “上个月月份”是 ${monthLabel(-1)}。
- “上上个月月份”是 ${monthLabel(-2)}。
- 选择榜单时间时严格使用以上对应关系，不要自行推测其他月份。`;

const rankingContext = `${navigationContext}

${rankingTimeContext}`;

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

export async function readCustomPriceRange(
  agent: RankingFilterAgent,
): Promise<string> {
  const result = await agent.aiQuery<{ priceRange: string }>(
    '{priceRange: string}，读取价格筛选面板中价格区间条下方明确显示的当前自定义价格区间完整文案。页面会用一条合并文案同时表示最低价和最高价，例如“15–30万”；请把这一个完整文案原样返回到 priceRange，不要拆成两个字段，不要读取预设价格选项，也不要根据滑块位置推测。',
  );
  const priceRange =
    typeof result?.priceRange === 'string' ? result.priceRange.trim() : '';
  if (!priceRange || priceRange === '不限' || priceRange === '全部') {
    throw new Error('没有读取到页面明确显示的非默认自定义价格区间。');
  }
  return priceRange;
}

export function reportCaseFailure(error: unknown): void {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
