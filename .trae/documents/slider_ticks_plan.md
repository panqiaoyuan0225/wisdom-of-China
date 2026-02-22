# 滑块刻度线优化计划

## 修改需求
1. 删除滑块右边的 "25 题" 显示
2. 在滑块轨道上添加刻度线 "|"，与下方数字完美对应

## 实现方案

### 1. 删除右侧题数显示
删除 `<span class="count-display">` 元素

### 2. 添加刻度线
在滑块轨道上添加刻度线，使用绝对定位与下方数字对齐

## 修改位置

### HTML 修改

**当前（第 274-290 行）：**
```html
<div class="slider-wrapper">
    <input type="range" class="count-slider" id="countSlider" min="5" max="50" step="5" value="25" oninput="updateCount(this.value)">
    <span class="count-display" id="countDisplay">25 题</span>
</div>
<div class="slider-labels">
    <span>5</span>
    ...
</div>
```

**改为：**
```html
<div class="slider-track">
    <div class="slider-ticks">
        <span>|</span><span>|</span><span>|</span><span>|</span><span>|</span>
        <span>|</span><span>|</span><span>|</span><span>|</span><span>|</span>
    </div>
    <input type="range" class="count-slider" id="countSlider" min="5" max="50" step="5" value="25" oninput="updateCount(this.value)">
</div>
<div class="slider-labels">
    <span>5</span>
    ...
</div>
```

### CSS 修改

**删除 `.slider-wrapper` 和 `.count-display` 样式**

**添加新样式：**
```css
.slider-track {
    position: relative;
    width: 100%;
}

.slider-ticks {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 14px;
    pointer-events: none;
    font-size: 12px;
    color: #b8962e;
    line-height: 12px;
}

.count-slider {
    width: 100%;
    /* 其他样式保持不变 */
}
```

### JavaScript 修改

删除 `updateCount` 函数中对 `countDisplay` 的引用，改为：
```javascript
function updateCount(value) {
    settings.count = parseInt(value);
}
```
