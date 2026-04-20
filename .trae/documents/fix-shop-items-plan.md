# 积分商城道具功能修复计划

## 问题分析

根据代码审查，发现以下问题：

### 1. 外观道具没有任何效果
- **位置**: `shop.html` L489-492
- **问题**: 购买外观道具（头像框-书卷、头像框-梅花、昵称特效）后，只是存储了道具数量，但没有实际应用逻辑
- **影响**: 用户购买了外观道具后看不到任何效果

### 2. 答错题没有扣分机制
- **位置**: `quiz.html` L3188-3189, L3280
- **问题**: 当前答错题会给2积分作为"答题参与"奖励，而不是扣分
- **影响**: 积分保护卡道具没有实际作用

### 3. 错题本可以随意清除
- **位置**: `quiz.html` L2907-2911
- **问题**: `confirmClearWrongBook()` 函数直接清除错题本，没有检查用户是否拥有错题重置卡
- **影响**: 用户不需要购买错题重置卡就能清除错题本

### 4. 礼包没有转换成实际道具
- **位置**: `shop.html` L533-545
- **问题**: 购买礼包后只是增加了礼包道具数量，没有将礼包内容转换成实际的答题道具
- **影响**: 每日礼包（提示×2、排除×1）和周卡礼包（所有基础道具×7）无法使用

---

## 修改方案

### 修改1: 实现外观道具效果

**文件**: `shop.html` 和 `profile.html`

1. 在 `shop.html` 中添加外观道具的使用按钮和逻辑
2. 在 `profile.html` 中读取并应用已激活的外观道具：
   - 头像框：在头像周围显示装饰框
   - 昵称特效：给昵称添加发光效果
3. 存储当前激活的外观道具到 localStorage

### 修改2: 实现答错扣分机制

**文件**: `quiz.html`

1. 修改答题逻辑，答错题扣2积分（而不是给2积分）
2. 实现积分保护卡功能：
   - 使用积分保护卡后，24小时内答题不计负分
   - 在 `ItemEffects` 中添加 `usePointsProtect()` 方法
   - 在答错扣分前检查积分保护是否激活

### 修改3: 限制错题本清除功能

**文件**: `quiz.html`

1. 修改 `confirmClearWrongBook()` 函数：
   - 检查用户是否拥有错题重置卡
   - 如果没有，提示用户需要购买错题重置卡
   - 如果有，消耗一张错题重置卡后清除错题本
2. 在 `ItemEffects` 中添加 `useWrongReset()` 方法

### 修改4: 实现礼包转换功能

**文件**: `shop.html`

1. 修改 `buyItem()` 函数，当购买礼包时：
   - 每日礼包：自动添加 hint×2, eliminate×1
   - 周卡礼包：自动添加 hint×7, eliminate×7, skip×7, double×7, revive×7
2. 礼包购买后不再存储礼包道具本身，而是直接转换成实际道具

---

## 详细修改步骤

### 步骤1: 修改 shop.html - 礼包转换逻辑

在 `buyItem()` 函数中添加礼包转换逻辑：

```javascript
function buyItem(itemId, price, name) {
    if (!confirm(`确定花费 ${price} 积分购买 ${name} 吗？`)) return;
    
    if (PointsManager.spendPoints(price, `购买 ${name}`)) {
        // 礼包特殊处理：直接转换成实际道具
        if (itemId === 'daily_pack') {
            PointsManager.addItem('hint');
            PointsManager.addItem('hint');
            PointsManager.addItem('eliminate');
            alert('购买成功！获得：提示×2、排除×1');
        } else if (itemId === 'weekly_pack') {
            for (let i = 0; i < 7; i++) {
                PointsManager.addItem('hint');
                PointsManager.addItem('eliminate');
                PointsManager.addItem('skip');
                PointsManager.addItem('double');
                PointsManager.addItem('revive');
            }
            alert('购买成功！获得所有基础道具×7');
        } else {
            PointsManager.addItem(itemId);
            alert('购买成功！');
        }
        updateDisplay();
        renderShop();
        renderMyItems();
    } else {
        alert('积分不足！');
    }
}
```

### 步骤2: 修改 shop.html - 外观道具使用逻辑

添加外观道具存储和使用功能：

```javascript
// 在 PointsManager 中添加
getAppearance() {
    const data = this.getData();
    return data.activeAppearance || {
        frame: null,
        nicknameEffect: null,
        frameExpiry: {},
        nicknameExpiry: null
    };
},

setAppearance(type, itemId) {
    const data = this.getData();
    if (!data.activeAppearance) {
        data.activeAppearance = { frame: null, nicknameEffect: null };
    }
    if (type === 'frame') {
        data.activeAppearance.frame = itemId;
    } else if (type === 'nickname') {
        data.activeAppearance.nicknameEffect = itemId;
        data.activeAppearance.nicknameExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30天
    }
    this.saveData(data);
}
```

### 步骤3: 修改 quiz.html - 答错扣分和积分保护

```javascript
// 在 ItemEffects 中添加
pointsProtectActive: false,
pointsProtectExpiry: 0,

usePointsProtect() {
    if (!PointsManager.useItem('points_protect')) {
        alert('没有积分保护卡道具！');
        return false;
    }
    this.pointsProtectActive = true;
    this.pointsProtectExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24小时
    alert('积分保护已激活！24小时内答题不计负分');
    return true;
},

isPointsProtectActive() {
    if (this.pointsProtectActive && Date.now() < this.pointsProtectExpiry) {
        return true;
    }
    this.pointsProtectActive = false;
    return false;
},

// 修改答题逻辑中的答错处理
if (!isCorrect) {
    // 答错扣2积分，但积分保护卡可以免除
    if (!ItemEffects.isPointsProtectActive()) {
        PointsManager.spendPoints(2, '答错扣分');
    }
    // ... 其他逻辑
}
```

### 步骤4: 修改 quiz.html - 错题本清除限制

```javascript
function confirmClearWrongBook() {
    const wrongResetCount = PointsManager.getItemCount('wrong_reset');
    if (wrongResetCount <= 0) {
        alert('清空错题本需要错题重置卡！请前往积分商城购买。');
        return;
    }
    
    if (confirm('确定要使用错题重置卡清空错题本吗？此操作不可恢复。')) {
        PointsManager.useItem('wrong_reset');
        WrongBookManager.clear();
        updateWrongBookUI();
        updateItemsBar();
        alert('错题本已清空！');
    }
}
```

### 步骤5: 修改 profile.html - 应用外观道具

在个人档案页面读取并显示外观道具效果：

```javascript
function applyAppearance() {
    const data = PointsManager.getData();
    const appearance = data.activeAppearance || {};
    
    // 应用头像框
    if (appearance.frame) {
        const avatar = document.querySelector('.avatar');
        avatar.classList.add('frame-' + appearance.frame);
    }
    
    // 应用昵称特效
    if (appearance.nicknameEffect && Date.now() < (appearance.nicknameExpiry || 0)) {
        const username = document.getElementById('usernameDisplay');
        username.classList.add('glow-effect');
    }
}
```

---

## 需要修改的文件清单

1. **shop.html**
   - 修改 `buyItem()` 函数实现礼包转换
   - 添加外观道具使用逻辑
   - 更新道具显示，添加使用按钮

2. **quiz.html**
   - 修改答错题逻辑，实现扣分机制
   - 添加积分保护卡使用功能
   - 修改错题本清除逻辑，需要错题重置卡
   - 更新道具栏，添加功能道具使用入口

3. **profile.html**
   - 读取并应用外观道具效果
   - 添加头像框和昵称特效的CSS样式

---

## 测试要点

1. 购买每日礼包后，检查是否获得提示×2、排除×1
2. 购买周卡礼包后，检查是否获得所有基础道具×7
3. 答错题时检查是否扣除2积分
4. 使用积分保护卡后，答错题不扣分
5. 尝试清空错题本，没有错题重置卡时应提示购买
6. 购买并使用外观道具后，在个人档案页面查看效果
