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
};
