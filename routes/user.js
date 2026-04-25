const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { success, error } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');

// 微信登录
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.json(error('缺少code参数'));
    }

    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WECHAT_APPID}&secret=${process.env.WECHAT_APPSECRET}&js_code=${code}&grant_type=authorization_code`;

    const wxRes = await axios.get(wxUrl);
    const { openid, unionid, session_key, errcode, errmsg } = wxRes.data;

    if (errcode) {
      console.error('微信登录失败:', errmsg);
      return res.json(error('微信登录失败'));
    }

    let user = req.db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);

    if (!user) {
      const result = req.db.prepare(
        'INSERT INTO users (openid, unionid, lang, level) VALUES (?, ?, ?, ?)'
      ).run(openid, unionid || null, 'korean', 1);
      user = req.db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    const token = jwt.sign(
      { id: user.id, openid: user.openid },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json(success({
      token,
      openid: user.openid,
      userInfo: {
        id: user.id,
        nickname: user.nickname || '',
        avatar: user.avatar || '',
        lang: user.lang,
        level: user.level,
        isVip: user.is_vip == 1,
        vipExpireTime: user.vip_expire_time
      }
    }));

  } catch (err) {
    console.error('登录错误:', err);
    res.json(error('登录失败'));
  }
});

// VIP测试账号登录（固定账号）
router.post('/vip-login', async (req, res) => {
  try {
    const db = req.db;
    const { userId } = req.body;

    // 查找VIP用户
    let user;
    if (userId) {
      user = db.prepare('SELECT * FROM users WHERE id = ? AND is_vip = 1').get(userId);
    }

    // 默认返回VIP测试用户
    if (!user) {
      user = db.prepare("SELECT * FROM users WHERE openid LIKE 'vip_test_%' AND is_vip = 1 LIMIT 1").get();
    }

    if (!user) {
      return res.status(401).json({ code: 401, msg: 'VIP用户不存在' });
    }

    const token = jwt.sign(
      { id: user.id, openid: user.openid },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json(success({
      token,
      openid: user.openid,
      userInfo: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar || '',
        lang: user.lang,
        level: user.level,
        isVip: user.is_vip == 1,
        vipExpireTime: user.vip_expire_time
      }
    }));
  } catch (err) {
    console.error('VIP登录错误:', err);
    res.json(error('登录失败'));
  }
});

// Web管理员登录（账号密码）
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username !== 'admin' || password !== 'xiaoyu_admin_2024') {
      return res.status(401).json({ code: 401, msg: '账号或密码错误' });
    }

    const token = jwt.sign(
      { id: 0, openid: 'admin_web', role: 'admin', username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json(success({
      token,
      openid: 'admin_web',
      role: 'admin',
      userInfo: {
        id: 0,
        nickname: '管理员',
        avatar: '',
        lang: 'korean',
        level: 99,
        isVip: true,
        vipExpireTime: null
      }
    }));
  } catch (err) {
    console.error('管理员登录错误:', err);
    res.json(error('登录失败'));
  }
});

// 获取用户信息
router.get('/info', authMiddleware, async (req, res) => {
  try {
    if (req.user.openid === 'admin_web') {
      return res.json(success({
        id: 0,
        nickname: '管理员',
        avatar: '',
        gender: 0,
        phone: '',
        lang: 'korean',
        level: 99,
        isVip: true,
        vipExpireTime: null,
        totalMinutes: 0,
        wordsCount: 0,
        createdAt: new Date().toISOString()
      }));
    }

    const user = req.db.prepare(
      'SELECT id, openid, nickname, avatar, gender, phone, lang, level, is_vip, vip_expire_time, total_minutes, words_count, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) {
      return res.json(error('用户不存在'));
    }

    res.json(success({
      id: user.id,
      nickname: user.nickname || '',
      avatar: user.avatar || '',
      gender: user.gender,
      phone: user.phone || '',
      lang: user.lang,
      level: user.level,
      isVip: user.is_vip == 1,
      vipExpireTime: user.vip_expire_time,
      totalMinutes: user.total_minutes,
      wordsCount: user.words_count,
      createdAt: user.created_at
    }));

  } catch (err) {
    console.error('获取用户信息错误:', err);
    res.json(error('获取失败'));
  }
});

// 用户统计数据
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.openid === 'admin_web') {
      return res.json(success({
        totalMinutes: 0,
        todayMinutes: 0,
        wordsCount: 0,
        level: 99,
        isVip: true,
        vipExpireTime: null,
        todayDate: new Date().toISOString().split('T')[0]
      }));
    }

    const user = req.db.prepare(
      'SELECT total_minutes, today_minutes, today_date, words_count, level, is_vip, vip_expire_time FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) {
      return res.json(error('用户不存在'));
    }

    res.json(success({
      totalMinutes: user.total_minutes || 0,
      todayMinutes: user.today_minutes || 0,
      wordsCount: user.words_count || 0,
      level: user.level || 1,
      isVip: user.is_vip == 1,
      vipExpireTime: user.vip_expire_time,
      todayDate: user.today_date
    }));
  } catch (err) {
    console.error('获取统计错误:', err);
    res.json(error('获取失败'));
  }
});

// 更新用户信息
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { nickname, avatar, gender, lang, level } = req.body;
    const updates = [];
    const values = [];

    if (nickname !== undefined) { updates.push('nickname = ?'); values.push(nickname); }
    if (avatar !== undefined) { updates.push('avatar = ?'); values.push(avatar); }
    if (gender !== undefined) { updates.push('gender = ?'); values.push(gender); }
    if (lang !== undefined) { updates.push('lang = ?'); values.push(lang); }
    if (level !== undefined) { updates.push('level = ?'); values.push(level); }

    if (updates.length === 0) {
      return res.json(error('没有要更新的字段'));
    }

    updates.push("updated_at = datetime('now')");
    values.push(req.user.id);

    req.db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const user = req.db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    res.json(success({
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      lang: user.lang,
      level: user.level,
      isVip: user.is_vip == 1,
      vipExpireTime: user.vip_expire_time
    }));

  } catch (err) {
    console.error('更新用户信息错误:', err);
    res.json(error('更新失败'));
  }
});

// VIP状态
router.get('/vip', authMiddleware, async (req, res) => {
  try {
    if (req.user.openid === 'admin_web') {
      return res.json(success({ isVip: true, expireTime: null }));
    }

    const user = req.db.prepare('SELECT is_vip, vip_expire_time FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.json(error('用户不存在'));
    }

    res.json(success({
      isVip: user.is_vip == 1,
      expireTime: user.vip_expire_time
    }));

  } catch (err) {
    console.error('获取VIP状态错误:', err);
    res.json(error('获取失败'));
  }
});

module.exports = router;
