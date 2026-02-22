const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const SECRET_KEY = 'honglou-four-classics-2026';

function hashPassword(password) {
  return crypto.createHmac('sha256', SECRET_KEY).update(password).digest('hex');
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.'));

const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('已连接到 users.db 数据库');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('创建表失败:', err.message);
  } else {
    console.log('users 表已准备就绪');
    const hashedPassword = hashPassword('Admin@2026');
    db.run(`
      INSERT OR IGNORE INTO users (username, password) VALUES ('admin', ?)
    `, [hashedPassword], (err) => {
      if (err) {
        console.error('插入初始账号失败:', err.message);
      } else {
        console.log('初始账号 admin/Admin@2026 已准备就绪');
      }
    });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: '用户名和密码不能为空' 
    });
  }

  const hashedPassword = hashPassword(password);
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  
  db.get(sql, [username, hashedPassword], (err, row) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: '登录失败: ' + err.message 
      });
    }
    
    if (row) {
      res.json({ 
        success: true, 
        message: '登录成功',
        user: { id: row.id, username: row.username }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }
  });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: '用户名和密码不能为空' 
    });
  }

  const hashedPassword = hashPassword(password);
  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  
  db.run(sql, [username, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ 
          success: false, 
          message: '用户名已存在' 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: '注册失败: ' + err.message 
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: '注册成功',
      userId: this.lastID 
    });
  });
});

app.listen(PORT, () => {
  console.log(`服务器已启动: http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log('数据库连接已关闭');
    process.exit(0);
  });
});
