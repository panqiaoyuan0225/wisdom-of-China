
# 完成 xiyou_stage3 页面 - 产品需求文档

## Overview
- **Summary**: 仿照 xiyou_stage2.html 的格式，完善 xiyou_stage3.html，添加五个关于西游记终成正果内容的专题
- **Purpose**: 为用户提供关于西游记终成正果的专题学习内容，与其他阶段保持一致的用户体验
- **Target Users**: 西游记爱好者、学生、读者

## Goals
- 完善 xiyou_stage3.html 的完整结构（HTML/CSS/JS）
- 添加五个关于西游记终成正果的专题内容
- 保持与 xiyou_stage2.html 一致的样式和交互风格
- 确保页面功能完整，导航正常

## Non-Goals (Out of Scope)
- 不添加新的答题功能（除非用户后续要求）
- 不修改整体网站的架构
- 不添加额外的图片资源

## Background & Context
- 用户已完成 xiyou_stage1 和 xiyou_stage2
- xiyou_stage3.html 已有基本框架，但需要完善
- 要求仿照 xiyou_stage2 的格式
- 五个专题都是关于西游记终成正果的内容

## Functional Requirements
- **FR-1**: 完善 xiyou_stage3.html 的完整 HTML 结构
- **FR-2**: 添加五个关于终成正果的专题内容到 contentData 对象
- **FR-3**: 实现左侧导航栏，支持切换不同专题
- **FR-4**: 确保返回主页面链接正常工作

## Non-Functional Requirements
- **NFR-1**: 页面样式与 xiyou_stage2.html 保持一致（相同的配色、字体、布局）
- **NFR-2**: 页面加载和切换流畅
- **NFR-3**: 移动端适配良好

## Constraints
- **Technical**: 使用 HTML/CSS/JavaScript，不引入新框架
- **Business**: 需在现有代码基础上修改，保持与网站风格统一
- **Dependencies**: 依赖 xiyou.html 作为返回页面

## Assumptions
- 用户希望五个专题内容都是关于西游记取得真经、修成正果的情节
- 专题命名采用与 stage2 类似的序号格式（拾叁、拾肆、拾伍、拾陆、拾柒）
- 不需要添加额外的答题功能

## Acceptance Criteria

### AC-1: 页面结构完整
- **Given**: xiyou_stage3.html 文件已打开
- **When**: 用户查看页面源码
- **Then**: 页面包含完整的 HTML、CSS、JavaScript 结构，与 xiyou_stage2.html 保持一致
- **Verification**: `programmatic`
- **Notes**: 确认所有标签闭合，样式完整

### AC-2: 五个终成正果专题已添加
- **Given**: 用户打开 xiyou_stage3.html
- **When**: 用户查看左侧导航栏
- **Then**: 导航栏显示五个关于终成正果的专题
- **Verification**: `human-judgment`
- **Notes**: 专题内容需围绕取得真经、修成正果展开

### AC-3: 导航功能正常
- **Given**: 用户在 xiyou_stage3.html 页面
- **When**: 用户点击左侧不同的导航项
- **Then**: 内容区域切换到对应的专题内容，导航项高亮显示
- **Verification**: `human-judgment`

### AC-4: 返回链接正常
- **Given**: 用户在 xiyou_stage3.html 页面
- **When**: 用户点击右上角返回按钮
- **Then**: 页面跳转到 xiyou.html
- **Verification**: `programmatic`

### AC-5: 样式一致
- **Given**: 用户对比 xiyou_stage2.html 和 xiyou_stage3.html
- **When**: 用户查看页面外观
- **Then**: 两个页面的配色、字体、布局风格完全一致
- **Verification**: `human-judgment`

## Open Questions
- [ ] 五个专题的具体标题和内容方向是否需要用户确认？
