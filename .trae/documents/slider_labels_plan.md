# 滑块数字标签添加计划

## 当前滑块设置
- 范围：5-50 题
- 步进：5 题
- 可选值：5, 10, 15, 20, 25, 30, 35, 40, 45, 50（共10个值）

## 方案：显示所有刻度标签

在滑块下方添加所有数字标签，使用 CSS 让标签均匀分布，与滑块位置精确对应。

### 修改位置

**第 277 行之后添加：**

```html
<div class="slider-wrapper">
    <input type="range" class="count-slider" id="countSlider" min="5" max="50" step="5" value="25" oninput="updateCount(this.value)">
    <span class="count-display" id="countDisplay">25 题</span>
</div>
<div class="slider-labels">
    <span>5</span>
    <span>10</span>
    <span>15</span>
    <span>20</span>
    <span>25</span>
    <span>30</span>
    <span>35</span>
    <span>40</span>
    <span>45</span>
    <span>50</span>
</div>
```

### CSS 样式说明

现有 `.slider-labels` 样式使用 `justify-content: space-between`，会让标签均匀分布，与滑块刻度对应。
