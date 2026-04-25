// 首页 - 口语
const { get } = require('../../utils/request.js');
const { api } = require('../../utils/api.js');
const { scene } = require('../../utils/api.js');
const { EVENTS, STORAGE_KEYS } = require('../../utils/constants.js');

Page({
  data: {
    // 语言
    currentLang: '韩语',
    langList: [
      { id: 1, name: '韩语', active: true },
      { id: 2, name: '日语', active: false },
      { id: 3, name: '英语', active: false },
      { id: 4, name: '法语', active: false },
      { id: 5, name: '粤语', active: false }
    ],
    
    // 场景列表
    sceneList: [],
    
    // 语伴信息
    partner: {
      name: '정우성',
      intro: '我是一个大学生，喜欢各种校园话题，让我们一起探索这个校园吧！',
      avatars: []
    },
    
    // 用户信息
    userInfo: null,
    
    // 学习数据
    stats: {
      todayMinutes: 0,
      totalMinutes: 0,
      wordsCount: 0
    },
    
    // 加载状态
    loading: true
  },
  
  onLoad() {
    // 监听事件
    this.onEventUpdate = this.handleEventUpdate.bind(this);
    
    // 获取语言设置
    const lang = wx.getStorageSync(STORAGE_KEYS.LANG);
    if (lang) {
      const langMap = { korean: '韩语', japanese: '日语', english: '英语', french: '法语', cantonese: '粤语' };
      this.setData({ currentLang: langMap[lang] || '韩语' });
    }
  },
  
  onShow() {
    // 刷新数据
    this.refreshData();
    
    // 获取用户信息
    const app = getApp();
    this.setData({ userInfo: app.globalData.userInfo });
  },
  
  onPullDownRefresh() {
    this.refreshData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },
  
  // 刷新数据
  async refreshData() {
    this.setData({ loading: true });
    
    try {
      // 并行获取场景列表和用户统计
      const [sceneData, statsData] = await Promise.all([
        this.getSceneList(),
        this.getStats()
      ]);
      
      this.setData({
        sceneList: sceneData,
        stats: statsData,
        loading: false
      });
    } catch (e) {
      console.error('刷新数据失败', e);
      this.setData({ loading: false });
    }
  },
  
  // 获取场景列表
  async getSceneList() {
    try {
      const data = await get(scene.list, {
        lang: wx.getStorageSync(STORAGE_KEYS.LANG) || 'korean'
      });
      return data.list || [];
    } catch (e) {
      // 如果接口不存在，使用默认数据
      return [
        { id: 1, title: '办理登机', desc: '在机场办理登机手续', hot: true, count: '1.5k' },
        { id: 2, title: '商场购物', desc: '如何在商场内顺利购物并与店员交流', hot: true, count: '207' },
        { id: 3, title: '免税便利店', desc: '在免税便利店购物并了解相关政策', hot: true, count: '81' },
        { id: 4, title: '研究生面试', desc: '准备并顺利通过研究生的面试', hot: true, count: '71' },
        { id: 5, title: '医院挂号流程', desc: '了解医院的挂号流程并顺利', hot: false, count: '52' },
        { id: 6, title: '七夕情人节', desc: '庆祝七夕情人节，表达爱意', hot: false, count: '38' }
      ];
    }
  },
  
  // 获取学习统计
  async getStats() {
    try {
      const data = await get('/api/common/stats');
      return data;
    } catch (e) {
      return {
        todayMinutes: 1,
        totalMinutes: 1,
        wordsCount: 0
      };
    }
  },
  
  // 跳转到语言选择
  goLanguage() {
    wx.navigateTo({ url: '/pages/language/language' });
  },
  
  // 跳转到聊天
  goChat() {
    wx.navigateTo({ url: '/pages/chat/chat' });
  },
  
  // 跳转到创意广场
  goCreative() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },
  
  // 跳转到自定义场景
  goCustomScene() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },
  
  // 切换语伴
  changePartner() {
    wx.showToast({ title: '换语伴功能开发中', icon: 'none' });
  },
  
  // 点击场景
  onSceneTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/chat/chat?sceneId=${id}`
    });
  },
  
  // 事件处理
  handleEventUpdate(eventName, data) {
    switch (eventName) {
      case EVENTS.USER_UPDATE:
        this.setData({ userInfo: data });
        break;
      case EVENTS.LANG_CHANGE:
        const langMap = { korean: '韩语', japanese: '日语', english: '英语', french: '法语', cantonese: '粤语' };
        this.setData({ currentLang: langMap[data] || '韩语' });
        this.refreshData();
        break;
    }
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: '小语笔记 - AI口语陪练',
      path: '/pages/index/index',
      imageUrl: '/assets/share.png'
    };
  }
});
