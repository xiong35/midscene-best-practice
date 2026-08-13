# 第一步：连接 Android 真机并运行首个 Demo

这一阶段模拟用户第一次使用 Midscene：在 Mac 上连接一台 Android 真机，使用 Midscene Studio 验证设备，然后运行一条可复现脚本，从懂车帝首页进入“我的”页面。

完成后应得到两个结果：

1. Midscene Studio 能识别并展示 Android 真机。
2. `pnpm demo:home-to-profile` 执行成功，并生成一份 Midscene 报告。

## 1. 环境要求

- macOS 12 或更高版本。
- Android 真机和一根支持数据传输的数据线。
- Android Studio，或者单独安装的 Android SDK Platform Tools。
- Midscene Studio Beta。
- Node.js `^20.19.0 || ^22.12.0 || >=24.0.0`。
- pnpm `>=9.3.0`。
- 一个 Midscene 支持的视觉模型及其 API Key。
- 真机上已经安装懂车帝。

本仓库初始化时验证过的本机环境为：

```text
Midscene Studio: 1.10.11-beta-20260811112752.0
@midscene/android: 1.10.11
ADB: 37.0.1
Node.js: 22.21.1
pnpm: 9.3.0
Java: 21.0.10
Android SDK: ~/Library/Android/sdk
```

版本不必完全相同，但 Node.js 和 pnpm 必须满足项目声明的范围。Studio 和 `@midscene/android` 建议使用相同的小版本。

## 2. 安装 Android SDK 和 ADB

如果已经安装 Android Studio：

1. 打开 Android Studio。
2. 进入 `Settings > Languages & Frameworks > Android SDK`。
3. 在 `SDK Tools` 中确认 `Android SDK Platform-Tools` 已安装。
4. 记下 Android SDK Location。

将以下内容加入 `~/.zshrc`，路径以 Android Studio 展示的实际位置为准：

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

重新打开终端，验证：

```bash
echo "$ANDROID_HOME"
adb version
```

## 3. 在手机上开启 USB 调试

不同品牌的菜单名称略有区别，通常按以下步骤操作：

1. 打开手机的“设置 > 关于手机”。
2. 连续点击“版本号”或“软件版本”约 7 次，开启开发者模式。
3. 返回设置，进入“开发者选项”。
4. 开启“USB 调试”。
5. 如果系统提供“USB 调试（安全设置）”，也一并开启，否则 Midscene 可能只能截图、不能点击。
6. 使用支持数据传输的数据线连接 Mac。
7. 保持手机解锁，在“是否允许这台电脑进行 USB 调试”弹窗中选择允许。
8. USB 用途建议选择“文件传输”，不要使用“仅充电”。

在 Mac 终端运行：

```bash
adb devices -l
```

成功示例：

```text
List of devices attached
ABC123 device usb:1-1 product:xxx model:xxx device:xxx transport_id:1
```

状态异常时：

- `unauthorized`：解锁手机并接受 USB 调试授权；没有弹窗时撤销 USB 调试授权后重新连接。
- `offline`：更换数据线或 USB 接口，然后执行 `adb kill-server` 和 `adb start-server`。
- 列表为空：检查数据线是否支持传输、USB 模式以及 Platform Tools 是否安装。

## 4. 使用 Midscene Studio 验证设备

1. 打开 `Midscene Studio Beta`。
2. 在 Overview 页面点击 `Refresh devices`。
3. 确认 Android 区域出现刚连接的设备。
4. 点击该设备，进入 Android Playground。
5. 打开 `Model Config`，填写模型服务地址、API Key、模型名和正确的 Model Family。
6. 保存后先执行一个无副作用的指令，例如“告诉我当前屏幕是什么页面”，确认截图和模型调用均正常。

API Key 属于敏感信息，不要把它写进文档、截图或提交到 Git。

Studio 仍显示 `No device` 时，先确认同一个终端中 `adb devices -l` 正常，再点击 `Refresh devices`。必要时完全退出并重启 Studio。

## 5. 初始化项目配置

在仓库根目录执行：

```bash
pnpm install
cp .env.example .env
```

编辑 `.env`：

```dotenv
MIDSCENE_MODEL_BASE_URL="你的模型服务地址"
MIDSCENE_MODEL_API_KEY="你的 API Key"
MIDSCENE_MODEL_NAME="模型名称"
MIDSCENE_MODEL_FAMILY="正确的模型系列"
ANDROID_SCREENSHOT_SHRINK_FACTOR="2"
ANDROID_DEVICE_ID=""
DONGCHEDI_PACKAGE="com.ss.android.auto"
```

注意：

- Studio 的 Model Config 和脚本的 `.env` 是两套入口，需要分别配置。
- 只连接一台设备时可以不填 `ANDROID_DEVICE_ID`。
- 多台设备同时连接时，从 `adb devices -l` 复制目标设备 ID。
- `MIDSCENE_MODEL_FAMILY` 配置错误会导致视觉定位明显偏移。
- `ANDROID_SCREENSHOT_SHRINK_FACTOR` 是本仓库的配置，代码会将它传给 `AndroidAgent`；它不是 Midscene 自动读取的环境变量。
- `.env` 已被 `.gitignore` 忽略，不要强制加入 Git。

### GPT-5 兼容服务的截图缩放

部分 OpenAI-compatible 或 Azure 类服务不会正确处理 GPT-5 的 `"detail": "original"`，而是在服务端把大图短边缩放到 768px。模型返回的是缩放后图片中的绝对坐标，Midscene 如果仍按原始截图尺寸解释，就会产生固定比例的点击偏移。这个问题属于截图坐标协议不一致，不能通过修改操作提示词稳定解决。相关背景可参考 [GPT-5 配置说明](https://midscenejs.com/zh/model-common-config.html#gpt) 和 [使用 Azure OpenAI 时点击坐标偏移](https://midscenejs.com/zh/faq.html#%E4%BD%BF%E7%94%A8-azure-openai-%E6%97%B6%E7%82%B9%E5%87%BB%E5%9D%90%E6%A0%87%E5%81%8F%E7%A7%BB)。

本仓库默认设置：

```dotenv
ANDROID_SCREENSHOT_SHRINK_FACTOR="2"
```

在本次真机环境中，Midscene 会在上传前完成以下缩放：

```text
1440x3200 -> 720x1600
```

压缩后短边为 720px，不再触发兼容服务的 768px 服务端缩放；Midscene 同时知道压缩倍率，因此能够把模型坐标正确还原为真机坐标。对于其他设备，可按照“压缩后的短边不超过 768px”选择倍率。移动端通常从 `2` 开始验证，不建议超过 `3`，避免小字号文本变得难以识别。

如果通过 Midscene Studio 执行，也要在 Studio 的 Agent 参数中单独配置 `screenshotShrinkFactor: 2`。脚本中的配置不会自动同步到 Studio。

## 6. 检查环境

执行：

```bash
pnpm check:android
```

该命令依次检查：

- Android SDK 和 ADB。
- 模型环境变量是否填写。
- 是否存在已授权的 Android 真机。
- 根据 `ANDROID_SCREENSHOT_SHRINK_FACTOR` 展示真机截图到模型截图的尺寸变化；GPT-5 配置下若压缩后短边仍超过 768px，则检查失败。
- ADB 是否具备注入触摸事件的权限。检查会点击屏幕范围外的坐标，不会操作页面中的真实控件。
- 多设备时是否指定了目标设备。
- 真机上是否安装了 `com.ss.android.auto`。

全部通过后会显示：

```text
环境检查通过，可以运行：pnpm demo:home-to-profile
```

如果提示找不到懂车帝，但手机上已经安装，可以查询真实包名：

```bash
adb shell pm list packages | grep -i auto
```

然后修改 `.env` 中的 `DONGCHEDI_PACKAGE`。

## 7. 准备懂车帝

首次执行前人工确认：

1. 懂车帝可以正常启动。
2. 已经完成首次用户协议或地区设置。
3. 网络正常。
4. 页面中没有必须由用户决定的登录、验证码或系统安全确认。

这个 Demo 不要求登录。若 App 的版本要求登录才能访问“我的”，请由用户自行完成登录，不要把账号密码写进脚本。

## 8. 运行首页到“我的”Demo

执行：

```bash
pnpm demo:home-to-profile
```

脚本会：

1. 连接指定真机。
2. 启动懂车帝。
3. 确保进入首页。
4. 断言首页已经展示。
5. 点击底部导航中的“我的”。
6. 断言当前为“我的”页面。

成功后终端会输出：

```text
Demo 通过：已从懂车帝首页进入“我的”页面。
```

Midscene 同时会输出 HTML 报告路径。用浏览器打开报告，检查规划、点击位置、前后截图和断言结果。

对于上述 `1440x3200` 真机，新报告中应看到：

```text
shotSize: 720x1600
shrunkShotToLogicalRatio: 1.875
```

第一次点击应直接落在右下角“我的”，不应进入“懂车帝热榜”等屏幕中部入口。如果报告中的 `shotSize` 仍是 `1440x3200`，说明 Agent 没有读取到本仓库的压缩配置。

## 9. 本阶段验收清单

- [ ] `adb devices -l` 中设备状态为 `device`。
- [ ] `pnpm check:android` 显示“ADB 触摸注入权限正常”。
- [ ] Studio Overview 中能够看到 Android 真机。
- [ ] Studio 能成功获取手机截图并调用模型。
- [ ] `pnpm check:android` 通过。
- [ ] `pnpm check:android` 显示发送给模型的截图为 `720x1600`（以当前 `1440x3200` 真机为例）。
- [ ] 懂车帝首页能够正常打开。
- [ ] `pnpm demo:home-to-profile` 通过。
- [ ] 报告中可以看到从首页进入“我的”的完整过程。

完成以上项目后，再开始编写懂车帝导航文档。不要在基础环境和最小 Demo 尚未通过时提前调试复杂测试用例。
