// 语种选择页面
const { STORAGE_KEYS, EVENTS } = require('../../utils/constants.js');

Page({
  data: {
    // 语言列表
    langList: [
      { id: 'korean', name: '韩语', active: true, flag: '🇰🇷' },
      { id: 'japanese', name: '日语', active: false, flag: '🇯🇵' },
      { id: 'english', name: '英语', active: false, flag: '🇺🇸' },
      { id: 'french', name: '法语', active: false, flag: '🇫🇷' },
      { id: 'cantonese', name: '粤语', active: false, flag: '🇭🇰' }
    ],
    
    // 等级列表
    levelList: [
      { id: 1, name: 'TOPIK 1', desc: '基础问候与简单交流' },
      { id: 2, name: 'TOPIK 2', desc: '简单对话与基本需求' },
      { id: 3, name: 'TOPIK 3', desc: '日常沟通与简单讨论' },
      { id: 4, name: 'TOPIK 4', desc: '流利对话与复杂话题' },
      { id: 5, name: 'TOPIK 5', desc: '高级商务与学术讨论' },
      { id: 6, name: 'TOPIK 6', desc: '母语级精通' }
    ],
    
    // 当前选中
    currentLang: 'korean',
    currentLevel: 1,
    currentLangName: '韩语'
  },
  
  onLoad() {
    // 加载已保存的设置
    const savedLang = wx.getStorageSync(STORAGE_KEYS.LANG) || 'korean';
    const savedLevel = wx.getStorageSync(STORAGE_KEYS.LEVEL) || 1;
    
    const langList = this.data.langList.map(item => ({
      ...item,
      active: item.id === savedLang
    }));
    
    this.setData({
      langList,
      currentLang: savedLang,
      currentLevel: savedLevel,
      currentLangName: langList.find(item => item.active)?.name || '韩语'
    });
  },
  
  // 选择语言
  selectLang(e) {
    const { id, name } = e.currentTarget.dataset;
    
    const langList = this.data.langList.map(item => ({
      ...item,
      active: item.id === id
    }));
    
    this.setData({
      langList,
      currentLang: id,
      currentLangName: name
    });
  },
  
  // 选择等级
  selectLevel(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ currentLevel: id });
  },
  
  // 保存设置
  saveSettings() {
    const app = getApp();
    
    // 保存到全局
    app.setCurrentLang(this.data.currentLang);
    app.setCurrentLevel(this.data.currentLevel);
    
    // 保存到本地存储
    wx.setStorageSync(STORAGE_KEYS.LANG, this.data.currentLang);
    wx.setStorageSync(STORAGE_KEYS.LEVEL, this.data.currentLevel);
    
    wx.showToast({ title: '保存成功', icon: 'success' });
    
    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: '小语笔记 - 选择学习语言',
      path: '/pages/language/language'
    };
  }
});
