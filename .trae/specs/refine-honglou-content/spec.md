# 红楼梦阶段页面内容优化 Spec

## Why
当前 honglou_stage1.html 的内容部分过多引用了《红楼梦》原文，应该改为用自己的语言进行总结和解读，使内容更具教育性和原创性。

## What Changes
- 修改 honglou_stage1.html 中5个专题的文字内容
- 将原文引用改为原创总结
- 保留表格、图框等结构化内容
- 保留必要的简短引用（如诗句、关键对话）

## Impact
- Affected specs: create-honglou-stages
- Affected code: honglou_stage1.html

## ADDED Requirements

### Requirement: 内容原创性
所有专题的文字内容（除表格、图框、诗句引用外）应为原创总结，而非直接引用原文。

#### Scenario: 用户阅读专题内容
- **WHEN** 用户查看任意专题内容
- **THEN** 文字部分应为教育性的总结解读，而非原文照搬

### Requirement: 引用规范
必要的引用应简短且标注出处。

#### Scenario: 引用诗句或对话
- **WHEN** 内容需要引用原文诗句或关键对话
- **THEN** 引用应简短，并使用引号或特殊样式标注
