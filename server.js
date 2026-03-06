require('dotenv').config();

const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (!supabase) {
  console.warn('警告: Supabase 环境变量未配置，请设置 SUPABASE_URL 和 SUPABASE_ANON_KEY');
} else {
  console.log('Supabase 已连接');
}

app.post('/sync-stats', async (req, res) => {
    const { userId, username, totalQuestions, correctAnswers, studyMinutes, masteredCount } = req.body;

    if (!userId && !username) {
        return res.status(400).json({ 
            success: false, 
            message: '用户ID或用户名不能为空' 
        });
    }

    if (!supabase) {
        return res.status(500).json({ 
            success: false, 
            message: '数据库未配置' 
        });
    }

    let targetUserId = userId;
    if (!targetUserId && username) {
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('user_id')
            .eq('username', username)
            .single();
        
        if (findError || !user) {
            return res.status(404).json({ 
                success: false, 
                message: '用户不存在' 
            });
        }
        targetUserId = user.user_id;
    }

    const { error } = await supabase
        .from('users')
        .update({
            total_questions: totalQuestions || 0,
            correct_answers: correctAnswers || 0,
            study_minutes: studyMinutes || 0,
            mastered_count: masteredCount || 0,
            last_sync: new Date().toISOString()
        })
        .eq('user_id', targetUserId);

    if (error) {
        return res.status(500).json({ 
            success: false, 
            message: '同步失败: ' + error.message 
        });
    }

    res.json({ 
        success: true, 
        message: '同步成功' 
    });
});

app.post('/sync-quiz-data', async (req, res) => {
    const { userId, username, quizData } = req.body;

    if (!userId && !username) {
        return res.status(400).json({ 
            success: false, 
            message: '用户ID或用户名不能为空' 
        });
    }

    if (!supabase) {
        return res.status(500).json({ 
            success: false, 
            message: '数据库未配置' 
        });
    }

    let targetUserId = userId;
    if (!targetUserId && username) {
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('user_id')
            .eq('username', username)
            .single();
        
        if (findError || !user) {
            return res.status(404).json({ 
                success: false, 
                message: '用户不存在' 
            });
        }
        targetUserId = user.user_id;
    }

    const { error } = await supabase
        .from('users')
        .update({
            quiz_data: quizData,
            last_sync: new Date().toISOString()
        })
        .eq('user_id', targetUserId);

    if (error) {
        return res.status(500).json({ 
            success: false, 
            message: '同步失败: ' + error.message 
        });
    }

    res.json({ 
        success: true, 
        message: '同步成功' 
    });
});

app.get('/load-quiz-data', async (req, res) => {
    const { userId, username } = req.query;

    if (!userId && !username) {
        return res.status(400).json({ 
            success: false, 
            message: '用户ID或用户名不能为空' 
        });
    }

    if (!supabase) {
        return res.status(500).json({ 
            success: false, 
            message: '数据库未配置' 
        });
    }

    let targetUserId = userId;
    if (!targetUserId && username) {
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('user_id')
            .eq('username', username)
            .single();
        
        if (findError || !user) {
            return res.status(404).json({ 
                success: false, 
                message: '用户不存在' 
            });
        }
        targetUserId = user.user_id;
    }

    const { data, error } = await supabase
        .from('users')
        .select('quiz_data, last_sync')
        .eq('user_id', targetUserId)
        .single();

    if (error) {
        return res.status(500).json({ 
            success: false, 
            message: '加载失败: ' + error.message 
        });
    }

    res.json({ 
        success: true, 
        data: data?.quiz_data || null,
        lastSync: data?.last_sync || null
    });
});

app.get('/leaderboard/rank', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ 
            success: false, 
            message: '数据库未配置' 
        });
    }

    const { data, error } = await supabase
        .from('users')
        .select('username, mastered_count, total_questions, correct_answers')
        .order('mastered_count', { ascending: false })
        .limit(50);

    if (error) {
        return res.status(500).json({ 
            success: false, 
            message: '获取排行榜失败' 
        });
    }

    const TOTAL_QUESTIONS = 800;
    const leaderboard = data.map(user => {
        const masteryPercent = TOTAL_QUESTIONS > 0 
            ? Math.round((user.mastered_count / TOTAL_QUESTIONS) * 100) 
            : 0;
        return {
            username: user.username,
            score: masteryPercent,
            masteredCount: user.mastered_count || 0
        };
    });

    res.json({ 
        success: true, 
        data: leaderboard 
    });
});

app.get('/leaderboard/time', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ 
            success: false, 
            message: '数据库未配置' 
        });
    }

    const { data, error } = await supabase
        .from('users')
        .select('username, study_minutes')
        .order('study_minutes', { ascending: false })
        .limit(50);

    if (error) {
        return res.status(500).json({ 
            success: false, 
            message: '获取排行榜失败' 
        });
    }

    const leaderboard = data.map(user => ({
        username: user.username,
        minutes: user.study_minutes || 0
    }));

    res.json({ 
        success: true, 
        data: leaderboard 
    });
});

app.get('/leaderboard/accuracy', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ 
            success: false, 
            message: '数据库未配置' 
        });
    }

    const { data, error } = await supabase
        .from('users')
        .select('username, total_questions, correct_answers')
        .gte('total_questions', 10)
        .order('correct_answers', { ascending: false })
        .limit(50);

    if (error) {
        return res.status(500).json({ 
            success: false, 
            message: '获取排行榜失败' 
        });
    }

    const leaderboard = data.map(user => {
        const accuracy = user.total_questions > 0 
            ? Math.round((user.correct_answers / user.total_questions) * 100) 
            : 0;
        return {
            username: user.username,
            accuracy: accuracy,
            totalQuestions: user.total_questions || 0,
            correctAnswers: user.correct_answers || 0
        };
    }).sort((a, b) => b.accuracy - a.accuracy);

    res.json({ 
        success: true, 
        data: leaderboard 
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    if (page.endsWith('.js')) {
        return res.sendFile(path.join(__dirname, page));
    }
    if (page.endsWith('.css')) {
        return res.sendFile(path.join(__dirname, page));
    }
    if (page.endsWith('.html')) {
        res.sendFile(path.join(__dirname, page));
    } else {
        res.sendFile(path.join(__dirname, page + '.html'));
    }
});

app.get('/images/:file', (req, res) => {
    res.sendFile(path.join(__dirname, 'images', req.params.file));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`服务器已启动: http://localhost:${PORT}`);
    });
}

module.exports = app;
