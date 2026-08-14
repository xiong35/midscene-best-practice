# 第一步：连接 Android 真机并运行首个 Demo

Midscene 是一款基于视觉的 UI 自动化 Agent：它对屏幕截图，交给视觉模型理解页面，再用自然语言指令（点击、断言、提取数据）操作真机，全程不依赖 App 源码、DOM 或测试专用接口。

这一阶段模拟用户第一次使用 Midscene 进行测试：在 Mac 上连接一台 Android 真机，运行一条 Hello World 的 YAML test case：从懂车帝首页进入“我的”页面。

> Midscene 支持在不同平台上运行测试，可参考[官方文档](https://midscenejs.com/quick-start.html)进行配置。本例以较复杂的真机测试场景进行示范。

## 1. 环境要求

- macOS 12 或更高版本。
- Android 真机和一根支持数据传输的数据线。
- Android SDK Platform Tools（包含 ADB）。
- Node.js `^20.19.0 || ^22.12.0 || >=24.0.0`。
- pnpm `>=9.3.0`。
- 一个 Midscene 支持的视觉模型及其 API Key。
- 真机上已经安装懂车帝 APP。

本仓库初始化时验证过的本机环境为：

```text
@midscene/android: 1.10.11
ADB: 37.0.1
Node.js: 22.21.1
pnpm: 9.3.0
Android SDK: ~/Library/Android/sdk
```

版本不必完全相同，但 Node.js 和 pnpm 必须满足项目声明的范围。

## 2. 安装 Android SDK Platform Tools

安装 Android SDK Platform Tools 后，确认 SDK 目录中存在可执行的 ADB：

```text
<Android SDK 目录>/platform-tools/adb
```

将以下内容加入 `~/.zshrc`。示例使用 macOS 上常见的 SDK 位置；如果安装在其他目录，请替换为实际路径：

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

## 4. 初始化项目配置

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
ANDROID_DEVICE_ID=""
DONGCHEDI_PACKAGE="com.ss.android.auto"
```

注意：

- 只连接一台设备时可以不填 `ANDROID_DEVICE_ID`。
- 多台设备同时连接时，从 `adb devices -l` 复制目标设备 ID。
- `MIDSCENE_MODEL_FAMILY` 必须与实际模型对应，取值和查法见下文“关于 Model Family”。
- `ANDROID_DEVICE_ID` 和 `DONGCHEDI_PACKAGE` 会替换 YAML Case 中的同名占位符；它们不是 Midscene 自动识别的标准环境变量。
- `.env` 已被 `.gitignore` 忽略，不要强制加入 Git。

## 5. 检查环境

执行：

```bash
pnpm check:android
```

该命令依次检查：

- Android SDK 和 ADB。
- 模型环境变量是否填写。
- 是否存在已授权的 Android 真机。
- 按 YAML Case 使用的 `screenshotShrinkFactor: 2` 展示真机截图到模型截图的尺寸变化；GPT-5 配置下若压缩后短边仍超过 768px，则检查失败。
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

## 6. 准备懂车帝 APP

首次执行前人工确认：

1. 懂车帝可以正常启动。
2. 已经完成首次用户协议或地区设置。
3. 网络正常。
4. 页面中没有必须由用户决定的登录、验证码或系统安全确认。

这个 Demo 不要求登录。若 App 的版本要求登录才能访问“我的”，请由用户自行完成登录，不要把账号密码写进脚本。

## 7. 运行首页到“我的”YAML Case

执行：

```bash
pnpm demo:home-to-profile
```

该命令实际执行：

```bash
midscene ./cases/01-home-to-profile.yaml
```

YAML Case 会：

1. 连接指定真机。
2. 启动懂车帝。
3. 点击底部导航中的“我的”。
4. 断言当前为“我的”页面，且底部“我的”处于选中状态。

成功后 Midscene 会在终端输出执行结果和 HTML 报告路径。用浏览器打开报告，检查规划、点击位置、前后截图和断言结果。

对于上述 `1440x3200` 真机，新报告中应看到：

```text
shotSize: 720x1600
shrunkShotToLogicalRatio: 1.875
```

第一次点击应直接落在右下角“我的”，不应进入“懂车帝热榜”等屏幕中部入口。如果报告中的 `shotSize` 仍是 `1440x3200`，请检查 YAML 中是否保留了 `screenshotShrinkFactor: 2`。

## 8. 本阶段验收清单

- [ ] `adb devices -l` 中设备状态为 `device`。
- [ ] `pnpm check:android` 显示“ADB 触摸注入权限正常”。
- [ ] `pnpm check:android` 通过。
- [ ] `pnpm check:android` 显示发送给模型的截图为 `720x1600`（以当前 `1440x3200` 真机为例）。
- [ ] 懂车帝首页能够正常打开。
- [ ] `pnpm demo:home-to-profile` 通过。
- [ ] 报告中可以看到从首页进入“我的”的完整过程。

## 附录

### 关于 Model Family

Model Family 告诉 Midscene 你用的是哪一类视觉模型，它决定了 Midscene 如何组织截图请求和解释模型返回的坐标。**填错不会报错，但会导致视觉定位明显偏移**，因此必须与你实际使用的模型对应。

不同模型对应的取值（如 `qwen-vl`、`gpt-5`、`doubao-vision` 等）以及各自的完整配置方式，请以官方文档为准：[模型通用配置说明](https://midscenejs.com/zh/model-common-config.html)。如果不确定自己的服务属于哪一类，先在这份文档里找到对应的模型，再回填 `.env`。

### 截图缩放：本项目统一使用 `screenshotShrinkFactor: 2`

移动端真机分辨率很高，直接上传原图既慢又可能触发部分模型服务的服务端缩放。本项目在所有 YAML Case 中统一设置：

```yaml
agent:
  screenshotShrinkFactor: 2
```

在本次 `1440x3200` 真机上，Midscene 会在上传前把截图压缩为 `720x1600`，并记住压缩倍率，从而把模型坐标正确还原为真机坐标。**选择倍率的经验法则：压缩后的短边不超过 768px。** 移动端通常从 `2` 开始验证，不建议超过 `3`，以免小字号文本难以识别。换设备时按此法则调整并同步修改 YAML Case。

> 如果你使用 GPT-5 或 Azure OpenAI 兼容服务，这个 768px 阈值背后有一个具体的坐标偏移原因，详见文末[附录：GPT-5 兼容服务为什么要限制短边](#附录gpt-5-兼容服务为什么要限制短边)。其他模型可以忽略该附录。

### GPT-5 兼容服务为什么要限制短边

> 只有使用 GPT-5 或 Azure OpenAI 兼容服务时才需要关注本节；其他模型按上文 `screenshotShrinkFactor: 2` 配置即可。

部分 OpenAI-compatible 或 Azure 类服务不会正确处理 GPT-5 的 `"detail": "original"`，而是在服务端把大图短边缩放到 768px。模型返回的是缩放后图片中的绝对坐标，Midscene 如果仍按原始截图尺寸解释，就会产生固定比例的点击偏移。这个问题属于截图坐标协议不一致，不能通过修改操作提示词稳定解决。

上文把短边压到不超过 768px（本例为 720px），正是为了不再触发这类服务端二次缩放，让 Midscene 用自己已知的压缩倍率完成坐标还原。相关背景可参考 [GPT-5 配置说明](https://midscenejs.com/zh/model-common-config.html#gpt) 和 [使用 Azure OpenAI 时点击坐标偏移](https://midscenejs.com/zh/faq.html#%E4%BD%BF%E7%94%A8-azure-openai-%E6%97%B6%E7%82%B9%E5%87%BB%E5%9D%90%E6%A0%87%E5%81%8F%E7%A7%BB)。
