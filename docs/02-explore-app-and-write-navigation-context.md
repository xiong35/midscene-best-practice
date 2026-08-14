# 第二步：探索 App 并编写 APP context 文档

这一阶段解决测试开始前“怎么抵达待测状态”的问题：把 App 跳转、状态变化等“隐性知识”沉淀为 APP context 文档，并通过 `aiActContext` 输入给 Midscene。测试用例只描述要验证的功能，不再重复写“先点哪里、再进入哪个页面”。

本仓库有两个对应产物：

- [`knowledge/dongchedi-navigation.md`](../knowledge/dongchedi-navigation.md)：用户根据 App 沉淀的 APP context 文档。
- [`cases/02-subscription-tab-switch.yaml`](../cases/02-subscription-tab-switch.yaml)：仅通过 `aiActContext` 携带 APP context 文档内容、测试内容纯净聚焦功能点的 YAML Case。

## 1. 用自然语言编写 APP context 文档

APP context 文档不需要使用专业术语，也不需要设计复杂格式。如下例，按页面分组，记录页面大致结构、页面关系即可：

```markdown
## 首页

- 上半部分金刚位有排行榜 icon，点击跳转到排行榜页面。
- 中间有搜索框，点击进入搜索页面。
- 下半部分有帖子瀑布流，可无限滚动。
- 底部有 fixed tab，分别有首页、选车、AI、消息、我的 Tab，点击进入对应页面。
```

这些朴素的自然语言已经为 Midscene 提供了以下信息：

1. 如何从当前页面抵达其他页面。
2. 当前截图没有展示出来的区域里还有什么。

只要表述清晰、事实清楚，可使用“金刚位”等术语或者中英文混写。

## 2. APP context 文档应包含什么

### 页面之间如何跳转

例如：

- 排行榜 icon 点击后进入排行榜页面。
- 底部“我的”Tab 点击后进入“我的”页面。
- “我的”页面中的“关注订阅”按钮点击后进入关注订阅页面。

### 页面大致内容

不需要描述每个控件，只记录后续导航或测试可能用到的区域。例如排行榜页面可以选择榜单、选择 filter、查看车型 list。

### 截图之外还有什么

Midscene 当前只能从截图理解页面。如果内容在长页面下方还没显示，需明确告诉它。例如：“我的”页面更下方不可见处有活动列表。

不需要记录坐标、固定滑动距离，也不需要教 AI 怎么点击普通按钮或怎么切换常见 Tab。足够强的模型可以根据截图自己完成这些操作。

## 3. 可以让 AI 帮忙整理，但避免 AI 补充不实内容

如果收集到的页面信息比较零散，可以把原始内容交给 AI 润色结构，整理成 APP context 文档。

AI 的作用是让信息更好读，不是替用户探索 App。生成 APP context 文档后仍要人工检查，删除 AI 自行补写的内容，并确认按钮名称和页面跳转与真实 App 一致。

## 4. APP context 文档与测试用例分开写

APP context 文档全局共享，负责：

- 页面之间怎么抵达。
- 页面上有哪些后续可能用到的入口。
- 截图暂时看不到的地方还有什么。

测试用例负责：

- 这次要验证哪个功能。
- 要操作什么状态。
- 最终应该看到什么结果。

不要在每条测试中重复页面路径，也不要把某条测试的断言写进公共 APP context 文档。

## 5. 使用 YAML 编写 Case

执行 YAML Case 需要安装 `@midscene/cli`。本仓库将它与 `@midscene/android` 固定在相同的 `1.10.11` 版本，安装依赖后会得到 `midscene` 命令。

Midscene Case 既可以使用 YAML，也可以使用 TypeScript。这个阶段不需要在步骤之间传递动态数据，因此使用 YAML 会更简洁；如果后续场景需要复用 `aiQuery` 的结果、执行条件判断或组合其他程序逻辑，可以改用 TypeScript。两种形式使用相同的 APP context 文档、模型配置、操作提示词和结果断言，不会改变“APP context 文档 + 测试目标”的整体工作流。真实动态数据的例子见[第三步：编写真实的基础用例](./03-write-real-base-case.md)。

一份 Android YAML Case 主要由三部分组成：

```yaml
android:
  deviceId: "${ANDROID_DEVICE_ID}"
  launch: "${DONGCHEDI_PACKAGE}"

agent:
  screenshotShrinkFactor: 2
  aiActContext: |
    首页
    - 底部有 fixed tab，分别有首页、选车、AI、消息、我的 Tab。

tasks:
  - name: 切换到订阅 Tab
    flow:
      - ai: 验证“关注订阅”页面可以切换到“订阅”Tab。
      - aiAssert: 当前页面的“订阅”Tab处于选中状态。
```

- `android.deviceId`：从 `.env` 读取设备 ID；值为空时使用第一台已连接设备。
- `android.launch`：从 `.env` 读取待启动的 App 包名。
- `agent.aiActContext`：使用 YAML 的 `|` 写入 APP context 文档内容，它会提供给所有 `ai`（即 `aiAct`）步骤。
- `agent.screenshotShrinkFactor`：继续使用阶段一验证过的截图缩放配置，避免 GPT-5 兼容服务产生坐标偏移。
- `tasks[].flow[].ai`：等价于 JavaScript 中的 `agent.aiAct()`。
- `tasks[].flow[].aiAssert`：等价于 JavaScript 中的 `agent.aiAssert()`。

> 注意：`aiActContext` 只会随 `ai`/`aiAct` 步骤传给模型，`aiAssert` 不会自动继承 APP context 文档。因此断言要写成不依赖这份文档也能判断的样子（例如“当前页面的‘订阅’Tab 处于选中状态”）。如果某个断言确实需要额外背景（例如相对月份），在 TypeScript 中通过 `aiAssert` 的 `options.context` 显式传入，参考第四步的公共辅助代码。

当前 YAML schema 没有 `aiActContextFile` 字段，不能直接引用外部 APP context 文档。因此这个最小 Demo 将 [`knowledge/dongchedi-navigation.md`](../knowledge/dongchedi-navigation.md) 中的 APP context 文档内容复制到 `agent.aiActContext` 多行字符串中。APP context 文档更新后，应同步更新 YAML；如果未来页面增多，可考虑用生成脚本自动同步或基于 TypeScript 测试。

`${ANDROID_DEVICE_ID}` 和 `${DONGCHEDI_PACKAGE}` 会在执行前从项目根目录的 `.env` 中替换。两份 YAML Case 使用相同的环境配置；模型配置同样继续读取现有 `.env`。

## 6. 关注订阅 Tab 切换 Demo

运行：

```bash
pnpm demo:subscription-tabs
```

命令实际执行的是：

```bash
midscene ./cases/02-subscription-tab-switch.yaml
```

第一条测试指令是：

```text
验证“关注订阅”页面可以切换到“订阅”Tab，完成后停留在“订阅”Tab。
```

它只描述页面功能，没有告诉 Midscene 应该先点击底部“我的”，再点击“关注订阅”。Midscene 需要从 APP context 文档中自己找到进入方式。

抵达后，Demo 会验证：

1. 可以切换到“订阅”Tab。
2. 可以从“订阅”切换到“关注”Tab。
3. 可以从“关注”切换回“订阅”Tab。
4. 每次切换后，对应 Tab 都处于选中状态。

## 7. 如何判断这套方式有效

打开 Midscene HTML 报告，检查：

- `AI Action Context` 中能看到 APP context 文档内容。
- 报告中的三个 Task 分别对应 YAML 中的三个 `tasks`。
- 测试指令中没有写进入页面的步骤。
- Midscene 能先进入“我的”，再进入“关注订阅”页面。
- Midscene 没有在帖子、榜单等无关区域反复尝试。
- “关注”和“订阅”Tab 的往返切换及断言全部通过。

建议从首页和“我的”页面分别运行一次。同一份 APP context 文档和测试代码都能成功，说明它可以复用，而不是只对一次录制有效。

## 8. 本阶段验收清单

- [ ] APP context 文档使用自己容易维护的自然语言。
- [ ] 记录了页面入口和截图之外的重要内容。
- [ ] 没有记录坐标、固定滑动距离或动态业务数据。
- [ ] 如果由 AI 润色，已经人工检查并删除它编造的内容。
- [ ] 测试指令没有描述进入页面的 setup 路径。
- [ ] Midscene 能抵达“关注订阅”页面并完成 Tab 往返切换。
