const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      success: false, 
      message: '数据库未配置' 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

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
};
