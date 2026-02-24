import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SECRET_KEY = 'honglou-four-classics-2026';

function hashPassword(password) {
  return crypto.createHmac('sha256', SECRET_KEY).update(password).digest('hex');
}

export default async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: '方法不允许' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '用户名和密码不能为空' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '密码长度至少6位' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '数据库未配置' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
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
        return new Response(JSON.stringify({ 
          success: false, 
          message: '用户名已存在' 
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ 
        success: false, 
        message: '注册失败: ' + error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: '注册成功',
      userId: data.id 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: '服务器错误: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
