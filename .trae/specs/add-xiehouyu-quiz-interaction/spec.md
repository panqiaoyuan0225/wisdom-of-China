# 歇后语答题功能改进 Spec

## Why
当前歇后语专题只能查看答案，用户无法真正答题并检验自己的答案是否正确。需要仿照sanguo_stage1.html的答题功能，让用户可以点击选项答题，并获得正确/错误的反馈。

## What Changes
- 将歇后语题目从简单的"查看答案"模式改为可交互的答题模式
- 用户点击选项后，系统判断对错并给出反馈
- 添加答题统计功能（可选）

## Impact
- Affected specs: xiyou_stage2.html中的歇后语专题
- Affected code: xiyou_stage2.html中的JavaScript代码

## ADDED Requirements
### Requirement: 交互式答题功能
系统应提供交互式答题功能，用户可以点击选项进行答题。

#### Scenario: 用户答对题目
- **WHEN** 用户点击正确选项
- **THEN** 按钮变为绿色，显示"回答正确"反馈，并显示解析

#### Scenario: 用户答错题目
- **WHEN** 用户点击错误选项
- **THEN** 按钮变为红色，显示"回答错误"反馈和正确答案，并显示解析

### Requirement: 答题反馈机制
系统应提供即时的答题反馈，包括正确/错误状态和解析内容。

### Requirement: 防止重复答题
用户答题后，该题的选项按钮应禁用，防止重复答题。
