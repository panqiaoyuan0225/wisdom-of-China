require('dotenv').config();

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const SECRET_KEY = 'honglou-four-classics-2026';

function hashPassword(password) {
  return crypto.createHmac('sha256', SECRET_KEY).update(password).digest('hex');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (!supabase) {
  console.warn('警告: Supabase 环境变量未配置，请设置 SUPABASE_URL 和 SUPABASE_ANON_KEY');
} else {
  console.log('Supabase 已连接');
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: '邮箱和密码不能为空' 
    });
  }

  if (!supabase) {
    return res.status(500).json({ 
      success: false, 
      message: '数据库未配置' 
    });
  }

  const hashedPassword = hashPassword(password);
  
  const { data, error } = await supabase
    .from('users')
    .select('id, email, username')
    .eq('email', email)
    .eq('password', hashedPassword)
    .single();

  if (error || !data) {
    return res.status(401).json({ 
      success: false, 
      message: '邮箱或密码错误' 
    });
  }

  res.json({ 
    success: true, 
    message: '登录成功',
    user: { id: data.id, email: data.email, username: data.username || email.split('@')[0] }
  });
});

app.post('/register', async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: '邮箱和密码不能为空' 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: '请输入有效的邮箱地址' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: '密码长度至少6位' 
    });
  }

  if (!supabase) {
    return res.status(500).json({ 
      success: false, 
      message: '数据库未配置' 
    });
  }

  const hashedPassword = hashPassword(password);
  const displayName = username || email.split('@')[0];
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password: hashedPassword, username: displayName }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ 
        success: false, 
        message: '该邮箱已注册' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: '注册失败: ' + error.message 
    });
  }

  res.status(201).json({ 
    success: true, 
    message: '注册成功',
    userId: data.id 
  });
});

app.post('/sync-stats', async (req, res) => {
    const { email, totalQuestions, correctAnswers, studyMinutes, masteredCount } = req.body;

    if (!email) {
        return res.status(400).json({ 
            success: false, 
            message: '邮箱不能为空' 
        });
    }

    if (!supabase) {
        return res.status(500).json({ 
            success: false, 
            message: '数据库未配置' 
        });
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
        .eq('email', email);

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

app.get('/:page', (req, res) => {
    const page = req.params.page;
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
