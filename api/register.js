const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const SECRET_KEY = 'honglou-four-classics-2026';

function hashPassword(password) {
  return crypto.createHmac('sha256', SECRET_KEY).update(password).digest('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      success: false, 
      message: '数据库未配置' 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
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
};
