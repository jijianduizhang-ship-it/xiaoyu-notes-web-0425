// 会员中心页面
const { get, post } = require('../../utils/request.js');
const { vip } = require('../../utils/api.js');
const { EVENTS } = require('../../utils/constants.js');

Page({
  data: {
    // 会员套餐
    packageList: [
      { id: 1, name: '三个月', price: 89, monthPrice: '29.67', benefit: '不限时长', tag: '早鸟价', selected: true },
      { id: 2, name: '一年', price: 159, monthPrice: '12.08', benefit: '不限时长', tag: '加送1个月', selected: false },
      { id: 3, name: '永久', price: 278, monthPrice: '598', benefit: '不限时长', tag: '限时特惠', selected: false }
    ],
    
    // VIP权益
    vipList: [
      { id: 1, name: 'AI助教', desc: '无限次畅聊，随时随地进行口语练习', icon: 'chat' },
      { id: 2, name: '多种语言', desc: '覆盖韩语、日语、英语等多个语种', icon: 'global' },
      { id: 3, name: '音色风格', desc: '多种音色，多种风格，多种情感', icon: 'voice' },
      { id: 4, name: '发音例句', desc: '智能例句推荐和发音帮助更好表达', icon: 'book' },
      { id: 5, name: '智能纠错', desc: '实时纠正语法，提供地道表达', icon: 'check' }
    ],
    
    // 用户信息
    userInfo: null,
    
    // 当前选中套餐
    selectedPackageId: 1,
    selectedPackage: null,
    
    // VIP状态
    isVip: false,
    vipExpireTime: '',
    
    // 加载状态
    loading: false,
    
    // 支付状态
    paying: false
  },
  
  onLoad() {
    // 监听事件
    this.onEventUpdate = this.handleEventUpdate.bind(this);
  },
  
  onShow() {
    const app = getApp();
    this.setData({
      userInfo: app.globalData.userInfo,
      isVip: app.globalData.isVip || false,
      vipExpireTime: app.globalData.vipExpireTime || ''
    });
    
    // 加载套餐数据
    this.loadPackages();
  },
  
  // 加载套餐数据
  async loadPackages() {
    try {
      const data = await get(vip.packages);
      if (data && data.list) {
        const packages = data.list.map((item, index) => ({
          ...item,
          selected: index === 0
        }));
        this.setData({ packageList: packages });
      }
    } catch (e) {
      // 使用默认数据
    }
  },
  
  // 选择套餐
  selectPackage(e) {
    const { id } = e.currentTarget.dataset;
    
    const packageList = this.data.packageList.map(item => ({
      ...item,
      selected: item.id === id
    }));
    
    const selectedPackage = packageList.find(item => item.id === id);
    
    this.setData({
      packageList,
      selectedPackageId: id,
      selectedPackage
    });
  },
  
  // 开通会员
  async onOpenVip() {
    const { selectedPackageId, paying, isVip } = this.data;
    
    if (paying) return;
    
    if (isVip) {
      wx.showToast({ title: '您已是会员', icon: 'none' });
      return;
    }
    
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    
    this.setData({ paying: true });
    
    try {
      // 创建订单
      const order = await post(vip.createOrder, {
        packageId: selectedPackageId
      });
      
      // 调用微信支付
      await this.requestWxPay(order);
      
    } catch (e) {
      console.error('创建订单失败', e);
      wx.showToast({ title: e.msg || '创建订单失败', icon: 'none' });
    } finally {
      this.setData({ paying: false });
    }
  },
  
  // 请求微信支付
  async requestWxPay(order) {
    try {
      const payment = await wx.requestPayment({
        timeStamp: order.timeStamp,
        nonceStr: order.nonceStr,
        package: order.package,
        signType: 'MD5',
        paySign: order.paySign
      });
      
      // 支付成功
      wx.showToast({ title: '支付成功', icon: 'success' });
      
      // 刷新会员状态
      this.refreshVipStatus();
      
    } catch (e) {
      // 用户取消或支付失败
      if (e.errMsg !== 'requestPayment:fail cancel') {
        wx.showToast({ title: '支付失败', icon: 'none' });
      }
    }
  },
  
  // 刷新会员状态
  async refreshVipStatus() {
    try {
      const { get } = require('../../utils/request.js');
      const data = await get(vip.myVip);
      
      const app = getApp();
      app.globalData.isVip = true;
      app.globalData.vipExpireTime = data.expireTime;
      
      this.setData({
        isVip: true,
        vipExpireTime: data.expireTime
      });
      
      // 通知其他页面
      app.triggerEvent(EVENTS.VIP_UPDATE, {
        isVip: true,
        expireTime: data.expireTime
      });
      
    } catch (e) {
      console.error('刷新会员状态失败', e);
    }
  },
  
  // 事件处理
  handleEventUpdate(eventName, data) {
    if (eventName === EVENTS.USER_UPDATE) {
      this.setData({ userInfo: data });
    }
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: '小语笔记 - 开通会员',
      path: '/pages/member/member'
    };
  }
});
