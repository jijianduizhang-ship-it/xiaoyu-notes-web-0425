const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');

// 获取学习统计
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = req.db.prepare(
      'SELECT today_minutes, total_minutes, words_count, today_date FROM users WHERE id = ?'
    ).get(req.user.id);
    
    if (!user) {
      return res.json(error('用户不存在'));
    }
    
    // 检查是否需要重置今日数据
    const today = new Date().toISOString().split('T')[0];
    let todayMinutes = user.today_minutes || 0;
    let todayWords = 0;
    
    // 如果不是今天，重置今日数据
    if (user.today_date !== today) {
      todayMinutes = 0;
      req.db.prepare(
        "UPDATE users SET today_minutes = 0, today_date = ? WHERE id = ?"
      ).run(today, req.user.id);
    }
    
    res.json(success({
      todayMinutes,
      totalMinutes: user.total_minutes || 0,
      todayWords,
      wordsCount: user.words_count || 0
    }));
    
  } catch (err) {
    console.error('获取统计错误:', err);
    res.json(error('获取失败'));
  }
});

// 意见反馈
router.post('/feedback', authMiddleware, async (req, res) => {
  try {
    const { content, contact } = req.body;
    
    if (!content) {
      return res.json(error('反馈内容不能为空'));
    }
    
    console.log(`用户反馈 [${req.user.id}]: ${content}, 联系方式: ${contact || '无'}`);
    
    res.json(success());
    
  } catch (err) {
    console.error('提交反馈错误:', err);
    res.json(error('提交失败'));
  }
});

module.exports = router;
