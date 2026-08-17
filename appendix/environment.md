# 运行环境附录

以下步骤用于快速确认 Android 真机、模型和截图链路可用；更完整的平台和模型配置请以 Midscene 官方文档为准。

## 最小要求

- Node.js `^20.19.0 || ^22.12.0 || >=24.0.0`
- pnpm `>=9.3.0`
- Android SDK Platform Tools 和可执行的 `adb`
- 已开启 USB 调试的 Android 真机
- Midscene 支持的视觉模型及 API Key
- 真机上已安装懂车帝 App

如果手机提供“USB 调试（安全设置）”，需要同时开启，否则可能只能截图、不能注入点击事件。

## 初始化

```bash
pnpm install
cp .env.example .env
```

在 `.env` 中填写：

```dotenv
MIDSCENE_MODEL_BASE_URL="模型服务地址"
MIDSCENE_MODEL_API_KEY="API Key"
MIDSCENE_MODEL_NAME="模型名称"
MIDSCENE_MODEL_FAMILY="对应的模型系列"
ANDROID_DEVICE_ID=""
DONGCHEDI_PACKAGE="com.ss.android.auto"
```

只连接一台设备时，`ANDROID_DEVICE_ID` 可以留空；连接多台设备时，填写 `adb devices -l` 中目标设备的 ID。`DONGCHEDI_PACKAGE` 是待启动 App 的包名。

`.env` 已被 Git 忽略，不要提交 API Key。

## 检查设备和模型

```bash
adb devices -l
pnpm check:android
```

检查通过后，可以运行最小点击链路：

```bash
pnpm demo:home-to-profile
```

这条 Smoke Case 只用于确认启动、截图、视觉定位、点击和断言能够工作，不属于 Context 泛化方法本身。

## 常见问题

- `unauthorized`：解锁手机并接受 USB 调试授权。
- 设备拒绝注入触摸事件：开启厂商提供的“USB 调试（安全设置）”。
- 找不到 App：使用 `adb shell pm list packages` 查询真实包名并更新 `DONGCHEDI_PACKAGE`。
- 点击出现固定比例偏移：先检查 `MIDSCENE_MODEL_FAMILY` 是否正确，再检查模型服务是否对截图进行了额外缩放。

本项目统一使用 `screenshotShrinkFactor: 2`。换设备后应确保压缩图仍能清晰识别；GPT-5 或部分 OpenAI-compatible 服务还应避免服务端再次缩放导致坐标偏移。

参考：

- [Midscene 快速开始](https://midscenejs.com/quick-start.html)
- [模型通用配置](https://midscenejs.com/zh/model-common-config.html)
- [GPT 模型配置](https://midscenejs.com/zh/model-common-config.html#gpt)
- [Azure OpenAI 点击坐标偏移](https://midscenejs.com/zh/faq.html#%E4%BD%BF%E7%94%A8-azure-openai-%E6%97%B6%E7%82%B9%E5%87%BB%E5%9D%90%E6%A0%87%E5%81%8F%E7%A7%BB)
