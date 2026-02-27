const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { username, totalQuestions, correctAnswers, studyMinutes, masteredCount } = req.body;

  if (!username) {
    return res.status(400).json({ 
      success: false, 
      message: '用户名不能为空' 
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

  const { error } = await supabase
    .from('users')
    .update({
      total_questions: totalQuestions || 0,
      correct_answers: correctAnswers || 0,
      study_minutes: studyMinutes || 0,
      mastered_count: masteredCount || 0,
      last_sync: new Date().toISOString()
    })
    .eq('username', username);

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
};
