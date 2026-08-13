import 'dotenv/config';

import { readFileSync } from 'node:fs';
import { agentFromAdbDevice } from '@midscene/android';

const navigationContext = readFileSync(
  new URL('../knowledge/dongchedi-navigation.md', import.meta.url),
  'utf8',
);

async function main() {
  const packageName = process.env.DONGCHEDI_PACKAGE?.trim();
  if (!packageName) {
    throw new Error('请在 .env 中设置 DONGCHEDI_PACKAGE。');
  }

  const deviceId = process.env.ANDROID_DEVICE_ID?.trim() || undefined;
  const agent = await agentFromAdbDevice(deviceId, {
    aiActContext: navigationContext,
    screenshotShrinkFactor: 2,
    groupName: '懂车帝销量榜第一名车型关注验证',
    groupDescription: '读取动态车型名称，添加关注，并在关注列表中验证同一车型。',
  });

  try {
    await agent.launch(packageName);

    await agent.aiAct(
      '进入排行榜页面，选择“销量榜”，让当前排名第 1 的车型完整显示在屏幕上。',
    );
    await agent.aiAssert(
      '当前位于排行榜的“销量榜”，并且能看到排名第 1 的车型。',
    );

    const result = await agent.aiQuery<{ carName: string }>(
      '{carName: string}，提取当前销量榜排名第 1 的车型名称。carName 只包含页面实际显示的完整车型名称。',
    );
    const carName =
      typeof result?.carName === 'string' ? result.carName.trim() : '';
    if (!carName) {
      throw new Error('没有读取到销量榜排名第 1 的车型名称。');
    }

    console.log(`本次测试车型：${carName}`);

    await agent.aiAct(
      `进入销量榜排名第 1 的车型“${carName}”的详情页。如果当前已经关注，先取消关注；然后重新添加关注，完成后保持已关注状态。`,
    );
    await agent.aiAssert(
      `当前是车型“${carName}”的详情页，并且该车型处于已关注状态。`,
    );

    await agent.aiAct(
      '前往“我的”页面，进入“关注订阅”，保持在“关注”Tab，并切换到汽车列表。',
    );
    await agent.aiAssert(
      `当前位于关注的汽车列表，并且列表中能看到车型“${carName}”。`,
    );

    console.log(`Case 通过：已关注“${carName}”并在关注列表中找到该车型。`);
  } finally {
    await agent.destroy();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
