# 滑块修改计划

## 修改需求
- 滑块范围：5-50 题
- 步进：5 题一隔（5, 10, 15, 20, 25, 30, 35, 40, 45, 50）

## 修改位置

### 1. 修改滑块 input 属性
**位置：第 275 行**

```html
<!-- 当前 -->
<input type="range" class="count-slider" id="countSlider" min="5" max="100" value="50" oninput="updateCount(this.value)">

<!-- 改为 -->
<input type="range" class="count-slider" id="countSlider" min="5" max="50" step="5" value="25" oninput="updateCount(this.value)">
```

### 2. 修改滑块标签
**位置：第 278-284 行**

```html
<!-- 当前 -->
<div class="slider-labels">
    <span>5</span>
    <span>25</span>
    <span>50</span>
    <span>75</span>
    <span>100</span>
</div>

<!-- 改为 -->
<div class="slider-labels">
    <span>5</span>
    <span>15</span>
    <span>25</span>
    <span>35</span>
    <span>50</span>
</div>
```

### 3. 修改默认显示值
**位置：第 276 行**

```html
<!-- 当前 -->
<span class="count-display" id="countDisplay">50 题</span>

<!-- 改为 -->
<span class="count-display" id="countDisplay">25 题</span>
```

### 4. 修改 JavaScript 默认值
**位置：第 308 行**

```javascript
// 当前
count: 50

// 改为
count: 25
```
