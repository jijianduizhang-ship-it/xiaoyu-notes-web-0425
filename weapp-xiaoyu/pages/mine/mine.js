// 我的页面
const { logout, wxLogin, getWxUserProfile } = require('../../utils/auth.js');
const { EVENTS, PAGES } = require('../../utils/constants.js');

Page({
  data: {
    // 用户信息
    userInfo: null,
    
    // 登录状态
    isLogin: false,
    
    // 学习数据
    stats: {
      todayMinutes: 0,
      todayWords: 0,
      totalMinutes: 0
    },
    
    // 会员状态
    isVip: false,
    vipExpireTime: '',
    
    // 菜单列表
    menuList: [
      { id: 1, name: '兑换码', icon: '🎁', iconClass: 'icon-gift', url: '/pages/mine/exchange' },
      { id: 2, name: '场景收藏', icon: '⭐', iconClass: 'icon-star', url: '/pages/mine/scene-favorites' },
      { id: 3, name: '单词收藏', icon: '📌', iconClass: 'icon-bookmark', url: '/pages/mine/word-favorites' },
      { id: 4, name: '我的对话分享', icon: '💬', iconClass: 'icon-share', url: '/pages/mine/chat-shares' },
      { id: 5, name: '分享得会员', icon: '🎖️', iconClass: 'icon-promo', url: '/pages/mine/invite' },
      { id: 6, name: '设置', icon: '⚙️', iconClass: 'icon-settings', url: '/pages/mine/settings' },
      { id: 7, name: '客服', icon: '📞', iconClass: 'icon-service', url: '/pages/mine/service' }
    ]
  },
  
  onLoad() {
    // 监听事件
    this.onEventUpdate = this.handleEventUpdate.bind(this);
  },
  
  onShow() {
    // 获取全局数据
    const app = getApp();
    
    this.setData({
      userInfo: app.globalData.userInfo || null,
      isLogin: app.globalData.isLogin || false,
      isVip: app.globalData.isVip || false,
      vipExpireTime: app.globalData.vipExpireTime || ''
    });
    
    // 刷新学习数据
    this.loadStats();
  },
  
  // 加载统计数据
  async loadStats() {
    const app = getApp();
    
    // 未登录时不请求数据
    if (!app.globalData.isLogin) {
      this.setData({
        stats: {
          todayMinutes: 0,
          todayWords: 0,
          totalMinutes: 0
        }
      });
      return;
    }
    
    try {
      const { get } = require('../../utils/request.js');
      const data = await get('/api/common/stats');
      
      this.setData({ stats: data || {} });
    } catch (e) {
      // 接口失败时使用默认值
      this.setData({
        stats: {
          todayMinutes: 0,
          todayWords: 0,
          totalMinutes: 0
        }
      });
    }
  },
  
  // 登录
  async onLogin() {
    // 检查是否有云开发环境
    const app = getApp();
    
    try {
      wx.showLoading({ title: '登录中...' });
      
      // 第一步：微信登录，获取 code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          timeout: 10000,
          success: res => {
            if (res.code) {
              resolve(res);
            } else {
              reject(new Error('获取code失败'));
            }
          },
          fail: reject
        });
      });
      
      // 第二步：请求后端登录接口
      const { post } = require('../../utils/request.js');
      const loginData = await post('/api/user/login', { code: loginRes.code });
      
      // 保存 token 和 openid
      wx.setStorageSync('token', loginData.token);
      wx.setStorageSync('openid', loginData.openid);
      
      // 第三步：获取微信用户信息（需要用户授权）
      let userInfo = loginData.userInfo;
      
      try {
        const profileRes = await new Promise((resolve, reject) => {
          wx.getUserProfile({
            desc: '用于完善个人资料',
            success: res => resolve(res),
            fail: reject
          });
        });
        
        // 更新用户信息到后端
        const updateData = await post('/api/user/update', {
          nickname: profileRes.userInfo.nickName,
          avatar: profileRes.userInfo.avatarUrl,
          gender: profileRes.userInfo.gender
        });
        
        userInfo = updateData;
      } catch (profileErr) {
        // 用户拒绝授权或获取用户信息失败，使用后端返回的基础信息
        console.log('获取微信用户信息失败或用户拒绝授权', profileErr);
      }
      
      // 保存用户信息
      if (userInfo) {
        wx.setStorageSync('userInfo', userInfo);
        
        // 更新全局数据
        app.globalData.userInfo = userInfo;
        app.globalData.token = loginData.token;
        app.globalData.isLogin = true;
        app.globalData.isVip = userInfo.isVip || false;
        app.globalData.vipExpireTime = userInfo.vipExpireTime || null;
        
        // 通知更新
        app.triggerEvent(EVENTS.LOGIN_SUCCESS, userInfo);
        app.triggerEvent(EVENTS.USER_UPDATE, userInfo);
      }
      
      // 刷新页面数据
      this.setData({
        userInfo: userInfo,
        isLogin: true,
        isVip: app.globalData.isVip,
        vipExpireTime: app.globalData.vipExpireTime || ''
      });
      
      wx.hideLoading();
      wx.showToast({ title: '登录成功', icon: 'success' });
      
    } catch (err) {
      wx.hideLoading();
      console.error('登录失败', err);
      wx.showToast({ 
        title: err.msg || '登录失败，请重试', 
        icon: 'none' 
      });
    }
  },
  
  // 跳转到会员中心
  goMember() {
    const app = getApp();
    if (!app.globalData.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => this.onLogin(), 500);
      return;
    }
    wx.navigateTo({ url: PAGES.MEMBER });
  },
  
  // 点击菜单
  onMenuTap(e) {
    const { url } = e.currentTarget.dataset;
    
    if (!url) return;
    
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => this.onLogin(), 500);
      return;
    }
    
    // 某些页面需要会员
    const vipOnlyPages = ['/pages/mine/exchange', '/pages/mine/invite'];
    if (vipOnlyPages.includes(url) && !this.data.isVip) {
      wx.showModal({
        title: '提示',
        content: '开通会员后可使用此功能',
        confirmText: '去开通',
        success: (res) => {
          if (res.confirm) {
            this.goMember();
          }
        }
      });
      return;
    }
    
    wx.navigateTo({ url });
  },
  
  // 跳转到编辑资料
  goEditProfile() {
    const app = getApp();
    if (!app.globalData.isLogin) {
      this.onLogin();
      return;
    }
    wx.navigateTo({ url: '/pages/mine/edit-profile' });
  },
  
  // 处理事件更新
  handleEventUpdate(eventName, data) {
    switch (eventName) {
      case EVENTS.USER_UPDATE:
        this.setData({ 
          userInfo: data,
          isLogin: true
        });
        break;
      case EVENTS.VIP_UPDATE:
        this.setData({
          isVip: data.isVip,
          vipExpireTime: data.expireTime || ''
        });
        break;
      case EVENTS.LOGOUT:
        this.setData({
          userInfo: null,
          isLogin: false,
          isVip: false,
          vipExpireTime: '',
          stats: {
            todayMinutes: 0,
            todayWords: 0,
            totalMinutes: 0
          }
        });
        break;
    }
  },
  
  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用登出方法
          logout();
          
          // 重置全局数据
          const app = getApp();
          app.onLogout();
          
          // 更新页面状态
          this.setData({
            userInfo: null,
            isLogin: false,
            isVip: false,
            vipExpireTime: '',
            stats: {
              todayMinutes: 0,
              todayWords: 0,
              totalMinutes: 0
            }
          });
          
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: '小语笔记 - AI口语陪练',
      path: '/pages/index/index'
    };
  }
});
