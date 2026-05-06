# 红楼梦诗词填空模块 Spec

## Why
在honglou_stage2.html中添加一个诗词填空模块，让用户可以学习和默写红楼梦中的经典诗词，增强学习互动性。

## What Changes
- 在honglou_stage2.html的侧边栏导航中添加新专题"拾贰 · 诗词填空"
- 在contentData对象中添加诗词填空模块的HTML内容
- 添加诗词卡片样式、默写框样式和结果显示样式
- 添加JavaScript函数实现默写功能（开启默写、关闭默写、批改检查）
- 添加poemLibrary对象存储红楼梦经典诗词原文

## Impact
- Affected specs: honglou_stage2.html
- Affected code: 导航栏、CSS样式、contentData对象、JavaScript函数

## ADDED Requirements
### Requirement: 诗词填空模块
系统应提供红楼梦经典诗词的默写练习功能。

#### Scenario: 用户开启默写
- **WHEN** 用户点击"开启默写"按钮
- **THEN** 隐藏诗词原文，显示默写输入框

#### Scenario: 用户提交批改
- **WHEN** 用户在输入框中默写诗词后点击"提交批改"按钮
- **THEN** 系统对比用户输入与标准答案，显示批改结果（正确为绿色，错误为红色下划线）

#### Scenario: 用户返回阅读
- **WHEN** 用户点击"返回阅读"按钮
- **THEN** 隐藏默写框和批改结果，恢复显示诗词原文，清空输入内容

### Requirement: 诗词内容
系统应包含以下红楼梦经典诗词：
- 《葬花吟》（节选）- 林黛玉
- 《咏白海棠》- 林黛玉
- 《咏菊》- 林黛玉
- 《秋窗风雨夕》- 林黛玉
- 《好了歌》- 跛足道人
- 《飞鸟各投林》- 结尾诗
