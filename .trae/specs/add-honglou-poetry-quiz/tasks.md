# Tasks

- [x] Task 1: 在导航栏添加新专题入口
  - [x] 在侧边栏sidebar中添加"拾贰 · 诗词填空"导航项
  - [x] 确保导航项的onclick事件正确调用changeTab函数

- [x] Task 2: 添加诗词填空模块的CSS样式
  - [x] 添加诗词卡片样式（.poem-card）
  - [x] 添加诗词内容样式（.poem-content）
  - [x] 添加默写框样式（.dictation-box, .dictation-input）
  - [x] 添加结果显示样式（.result-display, .correct, .wrong）
  - [x] 添加按钮组样式（.btn-group）

- [x] Task 3: 在contentData中添加诗词填空模块内容
  - [x] 添加"拾贰 · 诗词填空"键值对
  - [x] 添加各首诗词的HTML结构（诗词卡片、原文显示区、按钮组、默写框、结果显示区）
  - [x] 包含《葬花吟》、《咏白海棠》、《咏菊》、《秋窗风雨夕》、《好了歌》、《飞鸟各投林》六首诗词

- [x] Task 4: 添加poemLibrary对象存储诗词原文
  - [x] 创建poemLibrary对象，包含所有诗词的标准文本
  - [x] 每首诗词使用唯一ID作为键名

- [x] Task 5: 添加JavaScript交互函数
  - [x] 添加openDict函数：开启默写模式
  - [x] 添加closeDict函数：关闭默写模式并重置状态
  - [x] 添加checkPoem函数：对比用户输入并显示批改结果

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 2
- Task 4 依赖 Task 3
- Task 5 依赖 Task 4
