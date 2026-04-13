window.SUPABASE_CONFIG = {
    url: 'https://icawhplodojtniydplrb.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljYXdocGxvZG9qdG5peWRwbHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTc2MzgsImV4cCI6MjA4NzI3MzYzOH0._hzQpBdQ5OjoXv_1ns7BzOmwoDX3tU9wNrRjbivO5xQ'
};

window.DataManager = {
    isLoading: false,
    syncTimer: null,
    
    // 所有的存储键名
    STORAGE_KEYS: [
        'quiz_history_v1',
        'quiz_wrong_book_v1',
        'category_stats_v1',
        'category_mastery_v1',
        'browsing_time_v1',
        'badge_data_v1',
        'user_profile_v1',
        'pending_badge_notification',
        'user_points_v1',
        'leaderboard_rank_v1',
        'last_user_id' // 新增：用于跟踪本地数据所属用户
    ],

    // 清理所有本地数据
    clearLocalData() {
        console.log('正在清理本地数据...');
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
            this.syncTimer = null;
        }
        
        // 清理已知的键
        this.STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
        
        // 额外安全保障：清理所有可能相关的旧数据
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('v1') || key.includes('quiz') || key.includes('user_') || key.includes('badge'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        console.log('本地数据已完全清理');
    },

    // 检查本地数据是否属于当前用户
    checkUserMatch() {
        const currentUserId = sessionStorage.getItem('userId');
        const lastUserId = localStorage.getItem('last_user_id');
        
        // 如果没有当前登录用户，不执行操作
        if (!currentUserId) return true;
        
        // 如果本地没有记录上次用户ID，或者上次ID与当前不符
        if (lastUserId && lastUserId !== currentUserId) {
            console.warn('检测到账号切换，正在清理旧账号残留数据');
            this.clearLocalData();
            localStorage.setItem('last_user_id', currentUserId);
            return false;
        }
        
        // 更新最后一次使用的用户ID
        localStorage.setItem('last_user_id', currentUserId);
        return true;
    },

    // 数据保存到本地并同步到云端
    async saveData(key, value) {
        // 在保存任何新数据前，确保用户匹配
        this.checkUserMatch();

        if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.setItem(key, value);
        }
        
        // 如果正在加载数据，则不触发同步
        if (this.isLoading) return;

        const userId = sessionStorage.getItem('userId');
        if (!userId) return; // 未登录不同步

        // 延迟同步，避免频繁请求
        if (this.syncTimer) clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => this.syncToCloud(), 2000);
    },

    // 数据同步到云端
    async syncToCloud() {
        if (this.isLoading) return;
        
        const userId = sessionStorage.getItem('userId');
        const username = sessionStorage.getItem('currentUser');
        if (!userId) return;

        // 同步前检查用户ID匹配，防止同步了错误的数据
        const lastUserId = localStorage.getItem('last_user_id');
        if (lastUserId && lastUserId !== userId) {
            console.error('用户ID不匹配，取消同步以防止数据污染');
            return;
        }

        const quizData = {
            history: JSON.parse(localStorage.getItem('quiz_history_v1') || '{}'),
            wrongBook: JSON.parse(localStorage.getItem('quiz_wrong_book_v1') || '[]'),
            categoryStats: JSON.parse(localStorage.getItem('category_stats_v1') || '{}'),
            mastery: JSON.parse(localStorage.getItem('category_mastery_v1') || '{}'),
            browsingTime: JSON.parse(localStorage.getItem('browsing_time_v1') || '{"totalMinutes":0}'),
            badgeData: JSON.parse(localStorage.getItem('badge_data_v1') || '{}'),
            profileData: JSON.parse(localStorage.getItem('user_profile_v1') || '{}'),
            pendingBadge: localStorage.getItem('pending_badge_notification') || null,
            pointsData: JSON.parse(localStorage.getItem('user_points_v1') || '{"totalPoints":0,"todayPoints":0,"lastDate":"","pointsHistory":[],"ownedItems":{},"streak":0}'),
            syncTime: Date.now()
        };

        try {
            // 同步基础统计数据
            let totalQuestions = 0;
            let correctAnswers = 0;
            let masteredCount = 0;
            
            Object.values(quizData.history).forEach(item => {
                totalQuestions += item.totalAttempts || 0;
                correctAnswers += item.correctCount || 0;
                if (item.totalAttempts > 0 && (item.correctCount / item.totalAttempts) >= 0.8) {
                    masteredCount++;
                }
            });

            await fetch('/sync-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    username,
                    totalQuestions,
                    correctAnswers,
                    studyMinutes: quizData.browsingTime.totalMinutes || 0,
                    masteredCount,
                    totalPoints: quizData.pointsData?.totalPoints || 0
                })
            });

            // 同步详细数据
            await fetch('/sync-quiz-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, username, quizData })
            });
            
            console.log('数据已同步到云端');
        } catch (e) {
            console.error('同步到云端失败:', e);
        }
    },

    // 从云端加载数据
    // forceOverwrite: 是否强制覆盖本地数据（登录时应为 true）
    async loadFromCloud(forceOverwrite = false) {
        const userId = sessionStorage.getItem('userId');
        const username = sessionStorage.getItem('currentUser');
        if (!userId) return;

        // 登录时或账号切换时，强制检查用户匹配
        const isUserMatch = this.checkUserMatch();
        // 如果账号不匹配，即使 forceOverwrite 为 false，我们也应该视为 true，因为本地数据是别人的
        const finalForceOverwrite = forceOverwrite || !isUserMatch;

        this.isLoading = true;
        try {
            const response = await fetch(`/load-quiz-data?userId=${userId}&username=${encodeURIComponent(username || '')}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                const cloudData = result.data;
                
                // 设置标志，防止加载过程中的写入触发同步
                
                // 合并或覆盖历史记录
                if (cloudData.history) {
                    const localHistory = finalForceOverwrite ? {} : JSON.parse(localStorage.getItem('quiz_history_v1') || '{}');
                    const mergedHistory = this.mergeHistory(localHistory, cloudData.history);
                    localStorage.setItem('quiz_history_v1', JSON.stringify(mergedHistory));
                }
                
                // 合并或覆盖错题本
                if (cloudData.wrongBook) {
                    const localWrongBook = finalForceOverwrite ? [] : JSON.parse(localStorage.getItem('quiz_wrong_book_v1') || '[]');
                    const mergedWrongBook = this.mergeWrongBook(localWrongBook, cloudData.wrongBook);
                    localStorage.setItem('quiz_wrong_book_v1', JSON.stringify(mergedWrongBook));
                }
                
                if (cloudData.categoryStats) localStorage.setItem('category_stats_v1', JSON.stringify(cloudData.categoryStats));
                if (cloudData.mastery) localStorage.setItem('category_mastery_v1', JSON.stringify(cloudData.mastery));
                
                if (cloudData.browsingTime) {
                    const localTime = finalForceOverwrite ? {totalMinutes:0} : JSON.parse(localStorage.getItem('browsing_time_v1') || '{"totalMinutes":0}');
                    const mergedTime = {
                        totalMinutes: Math.max(localTime.totalMinutes || 0, cloudData.browsingTime.totalMinutes || 0)
                    };
                    localStorage.setItem('browsing_time_v1', JSON.stringify(mergedTime));
                }
                
                if (cloudData.badgeData) localStorage.setItem('badge_data_v1', JSON.stringify(cloudData.badgeData));
                if (cloudData.profileData) localStorage.setItem('user_profile_v1', JSON.stringify(cloudData.profileData));
                if (cloudData.pendingBadge) localStorage.setItem('pending_badge_notification', cloudData.pendingBadge);
                
                // 合并或覆盖积分数据
                if (cloudData.pointsData) {
                    const localPoints = finalForceOverwrite ? {"totalPoints":0,"todayPoints":0,"lastDate":"","pointsHistory":[],"ownedItems":{},"streak":0} : JSON.parse(localStorage.getItem('user_points_v1') || '{"totalPoints":0,"todayPoints":0,"lastDate":"","pointsHistory":[],"ownedItems":{},"streak":0}');
                    const mergedPoints = this.mergePoints(localPoints, cloudData.pointsData);
                    localStorage.setItem('user_points_v1', JSON.stringify(mergedPoints));
                }
                
                // 确保 last_user_id 被设置
                localStorage.setItem('last_user_id', userId);
                
                console.log(finalForceOverwrite ? '已从云端加载并覆盖本地数据' : '已从云端加载并合并最新数据');
                return true;
            }
        } catch (e) {
            console.error('从云端加载数据失败:', e);
        } finally {
            this.isLoading = false;
        }
        return false;
    },

    mergeHistory(local, cloud) {
        const merged = { ...cloud };
        for (const [id, localItem] of Object.entries(local)) {
            if (!merged[id]) {
                merged[id] = localItem;
            } else {
                merged[id] = {
                    totalAttempts: Math.max(localItem.totalAttempts || 0, merged[id].totalAttempts || 0),
                    correctCount: Math.max(localItem.correctCount || 0, merged[id].correctCount || 0),
                    wrongCount: Math.max(localItem.wrongCount || 0, merged[id].wrongCount || 0),
                    lastAttemptTime: Math.max(localItem.lastAttemptTime || 0, merged[id].lastAttemptTime || 0)
                };
            }
        }
        return merged;
    },

    mergeWrongBook(local, cloud) {
        const merged = [...cloud];
        const cloudIds = new Set(cloud.map(item => item.id));
        for (const localItem of local) {
            if (!cloudIds.has(localItem.id)) {
                merged.push(localItem);
            } else {
                const cloudIndex = merged.findIndex(item => item.id === localItem.id);
                if (cloudIndex >= 0) {
                    merged[cloudIndex].count = Math.max(localItem.count || 1, merged[cloudIndex].count || 1);
                    merged[cloudIndex].timestamp = Math.max(localItem.timestamp || 0, merged[cloudIndex].timestamp || 0);
                }
            }
        }
        return merged;
    },

    mergePoints(local, cloud) {
        // 合并积分数据：取较大的总积分
        const merged = {
            totalPoints: Math.max(local.totalPoints || 0, cloud.totalPoints || 0),
            todayPoints: local.todayPoints || 0,
            lastDate: local.lastDate || cloud.lastDate || '',
            streak: Math.max(local.streak || 0, cloud.streak || 0),
            ownedItems: { ...cloud.ownedItems },
            pointsHistory: [...(cloud.pointsHistory || [])]
        };
        
        // 合并拥有的道具：取较大数量
        if (local.ownedItems) {
            for (const [itemId, count] of Object.entries(local.ownedItems)) {
                if (!merged.ownedItems[itemId] || count > merged.ownedItems[itemId]) {
                    merged.ownedItems[itemId] = count;
                }
            }
        }
        
        // 合并积分历史：去重并按时间排序
        const localHistory = local.pointsHistory || [];
        const cloudHistorySet = new Set((cloud.pointsHistory || []).map(h => h.time));
        
        for (const item of localHistory) {
            if (!cloudHistorySet.has(item.time)) {
                merged.pointsHistory.push(item);
            }
        }
        
        // 按时间排序
        merged.pointsHistory.sort((a, b) => b.time - a.time);
        
        // 只保留最近100条记录
        if (merged.pointsHistory.length > 100) {
            merged.pointsHistory = merged.pointsHistory.slice(0, 100);
        }
        
        return merged;
    }
};
