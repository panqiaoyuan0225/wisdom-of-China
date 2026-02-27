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
};
