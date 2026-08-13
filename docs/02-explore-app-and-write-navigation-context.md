# 第二步：探索 App 并编写导航文档

这一阶段解决测试开始前“怎么抵达”的问题：把你探索 App 时记下来的页面信息作为 `aiActContext` 提供给 Midscene。测试用例只描述要验证的功能，不再重复写“先点哪里、再进入哪个页面”。

本仓库有两个对应产物：

- [`knowledge/dongchedi-navigation.md`](../knowledge/dongchedi-navigation.md)：用户探索 App 后沉淀的页面笔记。
- [`cases/02-subscription-tab-switch.yaml`](../cases/02-subscription-tab-switch.yaml)：通过 `aiActContext` 携带页面笔记、但不在测试步骤中提供进入路径的 YAML Case。

## 1. 用自己的话记下来就够了

导航文档不需要使用专业术语，也不需要设计复杂格式。像下面这样，按页面分组，把看到的内容直接写下来就可以：

```markdown
## 首页

- 上半部分金刚位有排行榜 icon，点击跳转到排行榜页面。
- 中间有搜索框，点击进入搜索页面。
- 下半部分有帖子瀑布流，可无限滚动。
- 底部有 fixed tab，分别有首页、选车、AI、消息、我的 Tab，点击进入对应页面。
```

这些朴素的自然语言已经告诉了 Midscene 两件关键事情：

1. 如何从当前页面抵达其他页面。
2. 当前截图没有展示出来的区域里还有什么。

只要事实清楚，使用“金刚位”“fixed tab”“filter”或者中英文混写都没有问题，不必为了写文档先学习一套术语。

## 2. 探索时主要记三类信息

### 页面之间怎么走

例如：

- 排行榜 icon 点击后进入排行榜页面。
- 底部“我的”Tab 点击后进入“我的”页面。
- “我的”页面中的“关注订阅”按钮点击后进入关注订阅页面。

### 页面上大概有什么

不需要描述每个控件，只记录后续导航或测试可能用到的区域。例如排行榜页面可以选择榜单、选择 filter，并查看车型 list。

### 截图之外还有什么

Midscene 当前只能从截图理解页面。如果内容在长页面下方还没显示，要明确告诉它。例如：“我的”页面更下方不可见处有精彩活动列表。

不需要记录坐标、固定滑动距离，也不需要教 AI 怎么点击普通按钮或怎么切换常见 Tab。足够强的模型可以根据截图自己完成这些操作。

## 3. 可以让 AI 帮忙整理，但不要让它补充事实

如果手写笔记比较零散，可以把原始内容交给 AI 润色结构。例如使用下面的提示词：

```text
请把下面的 App 探索笔记整理成一份提供给 UI 自动化 Agent 的导航文档。

要求：
1. 使用简单自然语言，按页面分组。
2. 保留页面之间的跳转关系，以及首屏之外不可见的内容。
3. 只整理我提供的事实，不推测、不补充、不编造页面、入口或路径。
4. 不添加坐标、固定滑动距离，也不要详细指导普通按钮、Tab 等常见控件如何操作。
5. 输出简短的 Markdown。

原始笔记：
<把你的笔记粘贴在这里>
```

AI 的作用是让信息更好读，不是替用户探索 App。生成后仍要人工检查，删除它自行补写的内容，并确认按钮名称和页面跳转与真实 App 一致。

## 4. 页面笔记与测试用例分开写

页面笔记负责：

- 页面之间怎么抵达。
- 页面上有哪些后续可能用到的入口。
- 截图暂时看不到的地方还有什么。

测试用例负责：

- 这次要验证哪个功能。
- 要操作什么状态。
- 最终应该看到什么结果。

不要在每条测试中重复页面路径，也不要把某条测试的断言写进公共页面笔记。

## 5. 使用 YAML 编写 Case

执行 YAML Case 需要安装 `@midscene/cli`。本仓库将它与 `@midscene/android` 固定在相同的 `1.10.11` 版本，安装依赖后会得到 `midscene` 命令。

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
- `agent.aiActContext`：使用 YAML 的 `|` 写入多行背景信息，它会提供给所有 `ai` 步骤。
- `agent.screenshotShrinkFactor`：继续使用阶段一验证过的截图缩放配置，避免 GPT-5 兼容服务产生坐标偏移。
- `tasks[].flow[].ai`：等价于 JavaScript 中的 `agent.aiAct()`。
- `tasks[].flow[].aiAssert`：等价于 JavaScript 中的 `agent.aiAssert()`。

当前 YAML schema 没有 `aiActContextFile` 字段，不能直接引用外部 Markdown。因此这个最小 Demo 将 [`knowledge/dongchedi-navigation.md`](../knowledge/dongchedi-navigation.md) 中的朴素页面笔记复制到 `agent.aiActContext` 多行字符串中。页面笔记更新后，应同步更新 YAML；如果未来页面很多，再考虑用生成脚本自动同步，不需要在最初阶段增加复杂度。

`${ANDROID_DEVICE_ID}` 和 `${DONGCHEDI_PACKAGE}` 会在执行前从项目根目录的 `.env` 中替换。两份 YAML Case 使用相同的环境配置；模型配置同样继续读取现有 `.env`。为了保持 Case 简洁，环境变量、截图缩放和 `aiActContext` 的原理统一在文档中说明，不在每份 YAML 中重复添加注释。

## 6. 关注订阅 Tab 切换 Demo

运行：

```bash
pnpm demo:subscription-tabs
```

命令实际执行的是：

```bash
midscene ./cases/02-subscription-tab-switch.yaml
```

如果不想修改 `.env`，也可以临时覆盖设备 ID：

```bash
pnpm demo:subscription-tabs -- --android.device-id <device-id>
```

第一条测试指令是：

```text
验证“关注订阅”页面可以切换到“订阅”Tab，完成后停留在“订阅”Tab。
```

它只描述页面功能，没有告诉 Midscene 应该先点击底部“我的”，再点击“关注订阅”。Midscene 需要从页面笔记中自己找到进入方式。

抵达后，Demo 会验证：

1. 可以切换到“订阅”Tab。
2. 可以从“订阅”切换到“关注”Tab。
3. 可以从“关注”切换回“订阅”Tab。
4. 每次切换后，对应 Tab 都处于选中状态。

## 7. 如何判断这套方式有效

打开 Midscene HTML 报告，检查：

- `AI Action Context` 中能看到你的页面笔记。
- 报告中的三个 Task 分别对应 YAML 中的三个 `tasks`。
- 测试指令中没有写进入页面的步骤。
- Midscene 能先进入“我的”，再进入“关注订阅”页面。
- Midscene 没有在帖子、榜单等无关区域反复尝试。
- “关注”和“订阅”Tab 的往返切换及断言全部通过。

建议从首页和“我的”页面分别运行一次。同一份页面笔记和测试代码都能成功，说明它可以复用，而不是只对一次录制有效。

## 8. 本阶段验收清单

- [ ] 页面笔记使用自己容易维护的自然语言。
- [ ] 记录了页面入口和截图之外的重要内容。
- [ ] 没有记录坐标、固定滑动距离或动态业务数据。
- [ ] 如果由 AI 润色，已经人工检查并删除它编造的内容。
- [ ] 测试指令没有描述进入页面的 setup 路径。
- [ ] Midscene 能抵达“关注订阅”页面并完成 Tab 往返切换。
