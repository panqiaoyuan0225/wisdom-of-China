# 红楼梦阶段页面创建 Spec

## Why
红楼梦主页面（honglou.html）已经链接了三个阶段页面，但这些页面尚未创建。需要创建 honglou_stage1.html、honglou_stage2.html、honglou_stage3.html 来完善红楼梦学习模块。

## What Changes
- 创建 `honglou_stage1.html`：第一阶段"大观寻梦"，包含5个专题
- 创建 `honglou_stage2.html`：第二阶段"烈火烹油"（基础框架）
- 创建 `honglou_stage3.html`：第三阶段"万艳同悲"（基础框架）

## Impact
- Affected specs: 红楼梦学习模块
- Affected code: 新增三个HTML文件

## ADDED Requirements

### Requirement: 创建 honglou_stage1.html
系统应提供一个红楼梦第一阶段页面，主题为"大观寻梦"，包含5个专题内容。

#### Scenario: 用户访问第一阶段页面
- **WHEN** 用户点击红楼梦主页的"第一阶段：大观寻梦"按钮
- **THEN** 系统应显示包含5个专题的左侧导航栏和右侧内容区

#### 设计规范
- **颜色主题**：粉色（#b03060 绛红/黛粉）与金色（#d4af37）
- **左侧栏背景**：粉色渐变（linear-gradient(180deg, #d4708a 0%, #b03060 100%)）
- **文字颜色**：金色（#d4af37）
- **活跃状态**：金色背景（#d4af37）配深粉色文字

#### 专题内容（5个）
1. 壹 · 黛玉进府
2. 贰 · 宝黛初见
3. 叁 · 金玉良缘
4. 肆 · 大观园诗社
5. 伍 · 百题挑战

### Requirement: 创建 honglou_stage2.html
系统应提供红楼梦第二阶段页面框架，主题为"烈火烹油"。

#### Scenario: 用户访问第二阶段页面
- **WHEN** 用户点击红楼梦主页的"第二阶段：烈火烹油"按钮
- **THEN** 系统应显示该阶段的导航框架（内容待填充）

### Requirement: 创建 honglou_stage3.html
系统应提供红楼梦第三阶段页面框架，主题为"万艳同悲"。

#### Scenario: 用户访问第三阶段页面
- **WHEN** 用户点击红楼梦主页的"第三阶段：万艳同悲"按钮
- **THEN** 系统应显示该阶段的导航框架（内容待填充）
