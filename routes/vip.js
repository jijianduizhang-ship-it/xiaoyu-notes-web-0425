const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');

// 获取套餐列表
router.get('/packages', async (req, res) => {
  try {
    const packages = req.db.prepare(
      'SELECT * FROM vip_packages WHERE status = 1 ORDER BY sort ASC'
    ).all();
    
    res.json(success({
      list: packages.map(p => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        monthPrice: (parseFloat(p.price) / p.months).toFixed(2),
        benefit: p.benefit,
        tag: p.tag,
        months: p.months
      }))
    }));
    
  } catch (err) {
    console.error('获取套餐列表错误:', err);
    res.json(error('获取失败'));
  }
});

// 创建订单
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { packageId } = req.body;
    
    if (!packageId) {
      return res.json(error('请选择套餐'));
    }
    
    // 获取套餐信息
    const pkg = req.db.prepare(
      'SELECT * FROM vip_packages WHERE id = ? AND status = 1'
    ).get(packageId);
    
    if (!pkg) {
      return res.json(error('套餐不存在'));
    }
    
    const orderNo = 'VIP' + Date.now() + uuidv4().replace(/-/g, '').substr(0, 8);
    
    // 创建订单
    req.db.prepare(
      `INSERT INTO vip_orders (order_no, user_id, package_id, price, status) VALUES (?, ?, ?, ?, 0)`
    ).run(orderNo, req.user.id, packageId, pkg.price);
    
    // 返回订单信息（实际应调用微信支付）
    res.json(success({
      orderNo,
      price: parseFloat(pkg.price),
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: uuidv4().replace(/-/g, ''),
      package: 'prepay_id=wx' + Date.now(),
      paySign: 'mock_pay_sign'
    }));
    
  } catch (err) {
    console.error('创建订单错误:', err);
    res.json(error('创建订单失败'));
  }
});

// 支付回调
router.post('/notify', async (req, res) => {
  try {
    const { orderNo, transactionId } = req.body;
    
    // 更新订单状态
    req.db.prepare(
      `UPDATE vip_orders SET status = 1, pay_time = datetime('now'), transaction_id = ? WHERE order_no = ?`
    ).run(transactionId, orderNo);
    
    // 获取订单信息
    const order = req.db.prepare('SELECT * FROM vip_orders WHERE order_no = ?').get(orderNo);
    
    if (order) {
      // 获取套餐月数
      const pkg = req.db.prepare('SELECT months FROM vip_packages WHERE id = ?').get(order.package_id);
      
      if (pkg) {
        const months = pkg.months;
        
        // 计算VIP到期时间
        let vipExpireTime;
        const user = req.db.prepare('SELECT vip_expire_time FROM users WHERE id = ?').get(order.user_id);
        
        if (user && user.vip_expire_time && new Date(user.vip_expire_time) > new Date()) {
          vipExpireTime = new Date(user.vip_expire_time);
          vipExpireTime.setMonth(vipExpireTime.getMonth() + months);
        } else {
          vipExpireTime = new Date();
          vipExpireTime.setMonth(vipExpireTime.getMonth() + months);
        }
        
        // 更新用户VIP状态
        req.db.prepare(
          'UPDATE users SET is_vip = 1, vip_expire_time = ? WHERE id = ?'
        ).run(vipExpireTime.toISOString(), order.user_id);
      }
    }
    
    res.json({ code: 200, msg: '支付成功' });
    
  } catch (err) {
    console.error('支付回调错误:', err);
    res.json(error('处理失败'));
  }
});

// 获取我的VIP信息
router.get('/my', authMiddleware, async (req, res) => {
  try {
    // admin_web 用户直接返回 VIP
    if (req.user.openid === 'admin_web') {
      return res.json(success({ isVip: true, expireTime: null, expireDays: 0 }));
    }

    const user = req.db.prepare('SELECT is_vip, vip_expire_time FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.json(error('用户不存在'));
    }

    res.json(success({
      isVip: user.is_vip == 1,
      expireTime: user.vip_expire_time,
      expireDays: user.vip_expire_time ?
        Math.max(0, Math.ceil((new Date(user.vip_expire_time) - new Date()) / (1000 * 60 * 60 * 24))) : 0
    }));

  } catch (err) {
    console.error('获取VIP信息错误:', err);
    res.json(error('获取失败'));
  }
});

module.exports = router;
