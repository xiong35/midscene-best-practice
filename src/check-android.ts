import 'dotenv/config';

import { spawnSync } from 'node:child_process';
import { accessSync, constants } from 'node:fs';
import path from 'node:path';
import { getConnectedDevices } from '@midscene/android';

const SCREENSHOT_SHRINK_FACTOR = 2;

const requiredModelVariables = [
  'MIDSCENE_MODEL_BASE_URL',
  'MIDSCENE_MODEL_API_KEY',
  'MIDSCENE_MODEL_NAME',
  'MIDSCENE_MODEL_FAMILY',
] as const;

function ok(message: string) {
  console.log(`✓ ${message}`);
}

function runAdb(args: string[]) {
  const result = spawnSync('adb', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `adb ${args.join(' ')} failed`);
  }

  return result.stdout.trim();
}

function getPhysicalScreenSize(deviceId: string) {
  const sizeOutput = runAdb(['-s', deviceId, 'shell', 'wm', 'size']);
  const sizes = [...sizeOutput.matchAll(/(\d+)x(\d+)/g)];
  const currentSize = sizes.at(-1);
  if (!currentSize) {
    throw new Error(`无法解析设备屏幕尺寸：${sizeOutput}`);
  }

  return {
    width: Number(currentSize[1]),
    height: Number(currentSize[2]),
  };
}

function checkTouchInjection(
  deviceId: string,
  screenSize: { width: number; height: number },
) {
  // Inject outside the physical screen so the permission check uses Android's
  // real input path without clicking a visible control.
  const outsideX = screenSize.width + 100;
  const outsideY = screenSize.height + 100;
  runAdb([
    '-s',
    deviceId,
    'shell',
    'input',
    'tap',
    String(outsideX),
    String(outsideY),
  ]);
}

async function main() {
  const problems: string[] = [];
  ok(`Android 截图压缩倍率：${SCREENSHOT_SHRINK_FACTOR}`);

  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!androidHome) {
    problems.push('ANDROID_HOME 或 ANDROID_SDK_ROOT 未设置。');
  } else {
    try {
      accessSync(path.join(androidHome, 'platform-tools', 'adb'), constants.X_OK);
      ok(`Android SDK: ${androidHome}`);
    } catch {
      problems.push(`${androidHome}/platform-tools/adb 不存在或不可执行。`);
    }
  }

  try {
    const adbVersion = runAdb(['version']).split('\n')[0];
    ok(adbVersion);
  } catch (error) {
    problems.push(
      `ADB 不可用：${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const missingModelVariables = requiredModelVariables.filter(
    (name) => !process.env[name] || process.env[name]?.includes('replace-with'),
  );
  if (missingModelVariables.length > 0) {
    problems.push(`.env 尚未配置：${missingModelVariables.join(', ')}`);
  } else {
    ok('Midscene 模型环境变量已配置（API Key 未打印）');
  }

  const devices = await getConnectedDevices();
  if (devices.length === 0) {
    problems.push(
      '没有检测到 Android 真机。请连接数据线、解锁手机、开启 USB 调试并接受电脑授权，然后重新运行。',
    );
  } else {
    const requestedDeviceId = process.env.ANDROID_DEVICE_ID?.trim();
    const selectedDevice = requestedDeviceId
      ? devices.find((device) => device.udid === requestedDeviceId)
      : devices[0];

    if (!selectedDevice) {
      problems.push(`未找到 ANDROID_DEVICE_ID=${requestedDeviceId}`);
    } else if (!requestedDeviceId && devices.length > 1) {
      problems.push(
        `检测到 ${devices.length} 台设备，请在 .env 中设置 ANDROID_DEVICE_ID。可选值：${devices
          .map((device) => device.udid)
          .join(', ')}`,
      );
    } else {
      ok(`Android 设备：${selectedDevice.udid}`);

      try {
        const screenSize = getPhysicalScreenSize(selectedDevice.udid);
        const shrunkSize = {
          width: Math.round(screenSize.width / SCREENSHOT_SHRINK_FACTOR),
          height: Math.round(screenSize.height / SCREENSHOT_SHRINK_FACTOR),
        };
        ok(
          `发送给模型的截图尺寸：${screenSize.width}x${screenSize.height} -> ${shrunkSize.width}x${shrunkSize.height}`,
        );

        if (
          process.env.MIDSCENE_MODEL_FAMILY === 'gpt-5' &&
          Math.min(shrunkSize.width, shrunkSize.height) > 768
        ) {
          problems.push(
            `使用 screenshotShrinkFactor: ${SCREENSHOT_SHRINK_FACTOR} 后截图短边仍大于 768px，GPT-5 兼容服务可能再次缩放图片并造成点击偏移。请根据文档调整 YAML Case。`,
          );
        }

        checkTouchInjection(selectedDevice.udid, screenSize);
        ok('ADB 触摸注入权限正常（测试点击位于屏幕外，不会操作页面控件）');
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        problems.push(
          detail.includes('INJECT_EVENTS') ||
            detail.includes('SecurityException')
            ? '设备已连接，但拒绝 ADB 触摸注入。请在手机开发者选项中开启“USB 调试（安全设置）”，重新连接并授权后再试。'
            : `无法验证 ADB 触摸注入：${detail}`,
        );
      }

      const packageName =
        process.env.DONGCHEDI_PACKAGE || 'com.ss.android.auto';
      const packagePath = runAdb([
        '-s',
        selectedDevice.udid,
        'shell',
        'pm',
        'path',
        packageName,
      ]);
      if (!packagePath.startsWith('package:')) {
        problems.push(
          `设备上没有找到懂车帝包 ${packageName}。请安装 App，或在 .env 中修正 DONGCHEDI_PACKAGE。`,
        );
      } else {
        ok(`懂车帝已安装：${packageName}`);
      }
    }
  }

  if (problems.length > 0) {
    console.error('\n还有以下项目需要处理：');
    for (const problem of problems) {
      console.error(`- ${problem}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('\n环境检查通过，可以运行：pnpm demo:home-to-profile');
}

main().catch((error) => {
  console.error(`\n环境检查失败：${
    error instanceof Error ? error.message : String(error)
  }`);
  process.exitCode = 1;
});
