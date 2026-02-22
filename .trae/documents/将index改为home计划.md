# 将 index.html 引用改为 home.html 的计划

## 背景
项目中存在 `index.html` 和 `home.html` 两个主页文件，需要将所有指向 `index.html` 的链接改为指向 `home.html`。

## 发现的引用位置

通过搜索，发现以下 6 个文件中存在对 `index.html` 的引用：

| 文件 | 行号 | 内容 |
|------|------|------|
| profile.html | 379 | `<a href="index.html" class="back-link">← 返回主页</a>` |
| badge.html | 413 | `<a href="index.html" class="back-link">← 返回主页</a>` |
| quiz.html | 942 | `<a href="index.html" class="back-link">← 返回主页</a>` |
| level.html | 219 | `<a href="index.html" class="back-link">← 返回主页</a>` |
| book.html | 128 | `<a href="index.html" class="back-link">← 返回主页</a>` |
| rank.html | 24 | `<a href="index.html" class="back-link">← 返回主页</a>` |

## 修改计划

将上述 6 个文件中的 `href="index.html"` 统一修改为 `href="home.html"`。

### 修改步骤

1. 修改 `profile.html` 第 379 行
2. 修改 `badge.html` 第 413 行
3. 修改 `quiz.html` 第 942 行
4. 修改 `level.html` 第 219 行
5. 修改 `book.html` 第 128 行
6. 修改 `rank.html` 第 24 行

## 预期结果

所有"返回主页"链接将指向 `home.html` 而非 `index.html`。
