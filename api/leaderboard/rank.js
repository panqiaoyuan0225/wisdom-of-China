const { createClient } = require('@supabase/supabase-js');

const TOTAL_QUESTIONS = 800;

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
    .select('username, mastered_count, total_questions, correct_answers')
    .order('mastered_count', { ascending: false })
    .limit(50);

  if (error) {
    return res.status(500).json({ 
      success: false, 
      message: '获取排行榜失败' 
    });
  }

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
};
