# 菜单和段位布局调整

## 修改内容

### 1. 三点菜单改为横向排列
- 将 `.menu-btn` 的 flex 方向从 `column` 改为 `row`
- 调整点之间的间距

### 2. 段位徽章居中
- 确保 `.rank-section` 内容居中显示
- 检查进度条和文字是否也居中对齐

---

## 实施步骤

### 修改菜单按钮样式
```css
.menu-btn {
    flex-direction: row; /* 原来是 column */
    gap: 6px; /* 调整横向间距 */
}
```

### 确认段位居中样式
检查 `.rank-section` 和相关元素的居中样式是否正确。

---

## 文件修改
- `home.html` - 调整 CSS 样式
