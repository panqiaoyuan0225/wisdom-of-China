window.SUPABASE_CONFIG = {
    url: 'https://icawhplodojtniydplrb.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljYXdocGxvZG9qdG5peWRwbHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTc2MzgsImV4cCI6MjA4NzI3MzYzOH0._hzQpBdQ5OjoXv_1ns7BzOmwoDX3tU9wNrRjbivO5xQ'
};

window.DataManager = {
    // 数据保存到本地并同步到云端
    async saveData(key, value) {
        if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.setItem(key, value);
        }
        
        // 延迟同步，避免频繁请求
        if (this.syncTimer) clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => this.syncToCloud(), 2000);
    },

    // 数据同步到云端
    async syncToCloud() {
        const userId = sessionStorage.getItem('userId');
        const username = sessionStorage.getItem('currentUser');
        if (!userId && !username) return;

        const quizData = {
            history: JSON.parse(localStorage.getItem('quiz_history_v1') || '{}'),
            wrongBook: JSON.parse(localStorage.getItem('wrong_book_v1') || '[]'),
            categoryStats: JSON.parse(localStorage.getItem('category_stats_v1') || '{}'),
            mastery: JSON.parse(localStorage.getItem('category_mastery_v1') || '{}'),
            browsingTime: JSON.parse(localStorage.getItem('browsing_time_v1') || '{"totalMinutes":0}'),
            badgeData: JSON.parse(localStorage.getItem('badge_data_v1') || '{}'),
            profileData: JSON.parse(localStorage.getItem('profile_data_v1') || '{}'),
            pendingBadge: localStorage.getItem('pending_badge_notification') || null,
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
                    masteredCount
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
    async loadFromCloud() {
        const userId = sessionStorage.getItem('userId');
        const username = sessionStorage.getItem('currentUser');
        if (!userId && !username) return;

        try {
            const response = await fetch(`/load-quiz-data?userId=${userId || ''}&username=${encodeURIComponent(username || '')}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                const cloudData = result.data;
                
                // 合并历史记录
                if (cloudData.history) {
                    const localHistory = JSON.parse(localStorage.getItem('quiz_history_v1') || '{}');
                    const mergedHistory = this.mergeHistory(localHistory, cloudData.history);
                    localStorage.setItem('quiz_history_v1', JSON.stringify(mergedHistory));
                }
                
                // 合并错题本
                if (cloudData.wrongBook) {
                    const localWrongBook = JSON.parse(localStorage.getItem('wrong_book_v1') || '[]');
                    const mergedWrongBook = this.mergeWrongBook(localWrongBook, cloudData.wrongBook);
                    localStorage.setItem('wrong_book_v1', JSON.stringify(mergedWrongBook));
                }
                
                if (cloudData.categoryStats) localStorage.setItem('category_stats_v1', JSON.stringify(cloudData.categoryStats));
                if (cloudData.mastery) localStorage.setItem('category_mastery_v1', JSON.stringify(cloudData.mastery));
                
                if (cloudData.browsingTime) {
                    const localTime = JSON.parse(localStorage.getItem('browsing_time_v1') || '{"totalMinutes":0}');
                    const mergedTime = {
                        totalMinutes: Math.max(localTime.totalMinutes || 0, cloudData.browsingTime.totalMinutes || 0)
                    };
                    localStorage.setItem('browsing_time_v1', JSON.stringify(mergedTime));
                }
                
                if (cloudData.badgeData) localStorage.setItem('badge_data_v1', JSON.stringify(cloudData.badgeData));
                if (cloudData.profileData) localStorage.setItem('profile_data_v1', JSON.stringify(cloudData.profileData));
                if (cloudData.pendingBadge) localStorage.setItem('pending_badge_notification', cloudData.pendingBadge);
                
                console.log('已从云端加载并合并最新数据');
                return true;
            }
        } catch (e) {
            console.error('从云端加载数据失败:', e);
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
    }
};
