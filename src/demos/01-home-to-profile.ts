import 'dotenv/config';

import {
  AndroidAgent,
  AndroidDevice,
  getConnectedDevices,
} from '@midscene/android';
import { getAndroidScreenshotShrinkFactor } from '../config/android-agent.js';

async function selectDevice() {
  const devices = await getConnectedDevices();
  if (devices.length === 0) {
    throw new Error(
      '没有检测到 Android 真机。请先运行 pnpm check:android 并解决连接问题。',
    );
  }

  const requestedDeviceId = process.env.ANDROID_DEVICE_ID?.trim();
  if (requestedDeviceId) {
    const device = devices.find(({ udid }) => udid === requestedDeviceId);
    if (!device) {
      throw new Error(`未找到 ANDROID_DEVICE_ID=${requestedDeviceId}`);
    }
    return device;
  }

  if (devices.length > 1) {
    throw new Error(
      '检测到多台 Android 设备，请在 .env 中设置 ANDROID_DEVICE_ID。',
    );
  }
  return devices[0];
}

async function main() {
  const connectedDevice = await selectDevice();
  const device = new AndroidDevice(connectedDevice.udid);
  const agent = new AndroidAgent(device, {
    screenshotShrinkFactor: getAndroidScreenshotShrinkFactor(),
  });

  try {
    await device.connect();
    await device.launch(
      process.env.DONGCHEDI_PACKAGE || 'com.ss.android.auto',
    );

    await agent.aiAct('点击底部导航中的“我的”，进入“我的”页面。');
    await agent.aiAssert(
      '当前是懂车帝的“我的”页面，底部导航中的“我的”处于选中状态。',
    );

    console.log('Demo 通过：已从懂车帝首页进入“我的”页面。');
  } finally {
    await agent.destroy();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
