/**
 * 部分 GPT-5 兼容服务不会正确处理 `detail: original`，会在服务端再次
 * 缩放大图并让模型坐标与 Midscene 坐标产生固定比例偏移。默认设为 2，
 * 可将当前 1440x3200 真机截图预先缩放为 720x1600，由 Midscene 负责
 * 坐标还原。
 *
 * GPT-5 配置：https://midscenejs.com/zh/model-common-config.html#gpt
 * 坐标偏移排查：https://midscenejs.com/zh/faq.html#%E4%BD%BF%E7%94%A8-azure-openai-%E6%97%B6%E7%82%B9%E5%87%BB%E5%9D%90%E6%A0%87%E5%81%8F%E7%A7%BB
 */
const DEFAULT_SCREENSHOT_SHRINK_FACTOR = 2;

export function getAndroidScreenshotShrinkFactor(): number {
  const configuredValue =
    process.env.ANDROID_SCREENSHOT_SHRINK_FACTOR?.trim();
  const screenshotShrinkFactor = configuredValue
    ? Number(configuredValue)
    : DEFAULT_SCREENSHOT_SHRINK_FACTOR;

  if (
    !Number.isFinite(screenshotShrinkFactor) ||
    screenshotShrinkFactor < 1
  ) {
    throw new Error(
      `ANDROID_SCREENSHOT_SHRINK_FACTOR 必须是大于等于 1 的有限数字，当前值：${configuredValue}`,
    );
  }

  return screenshotShrinkFactor;
}

export function getShrunkScreenshotSize(
  width: number,
  height: number,
  screenshotShrinkFactor: number,
) {
  return {
    width: Math.round(width / screenshotShrinkFactor),
    height: Math.round(height / screenshotShrinkFactor),
  };
}
