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
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: '用户名和密码不能为空' 
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
    .select('id, username')
    .eq('username', username)
    .eq('password', hashedPassword)
    .single();

  if (error || !data) {
    return res.status(401).json({ 
      success: false, 
      message: '用户名或密码错误' 
    });
  }

  res.json({ 
    success: true, 
    message: '登录成功',
    user: { id: data.id, username: data.username }
  });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: '用户名和密码不能为空' 
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
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, password: hashedPassword }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ 
        success: false, 
        message: '用户名已存在' 
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`服务器已启动: http://localhost:${PORT}`);
  });
}

module.exports = app;
