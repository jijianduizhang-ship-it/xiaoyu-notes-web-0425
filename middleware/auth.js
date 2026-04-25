// JWT认证中间件
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // 尝试从cookie或query获取token
    const token = req.query.token || req.cookies?.token;
    if (token) {
      req.headers.authorization = `Bearer ${token}`;
    }
  }
  
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ code: 401, msg: '请先登录' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, msg: '登录已过期' });
  }
}

// 允许未登录访问的路由
function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // token无效，忽略继续
    }
  }
  
  next();
}

module.exports = { authMiddleware, optionalAuth };
