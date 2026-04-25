// 情景课页面
const { get } = require('../../utils/request.js');
const { course } = require('../../utils/api.js');

Page({
  data: {
    // 当前选中的tab
    activeTab: 0,
    
    // 课程列表
    courseList: [],
    
    // 加载状态
    loading: true,
    
    // 是否有更多
    hasMore: true,
    
    // 加载更多
    loadingMore: false
  },
  
  onLoad() {
    this.loadCourse();
  },
  
  onShow() {
    // 每次显示刷新学习进度
    this.refreshProgress();
  },
  
  onPullDownRefresh() {
    this.loadCourse().finally(() => {
      wx.stopPullDownRefresh();
    });
  },
  
  // 加载课程
  async loadCourse() {
    this.setData({ loading: true });
    
    try {
      const data = await get(course.list);
      
      // API返回 { list: [{id, name, desc, day, free}] } 扁平列表
      // 按 day 分组
      const list = data.list || [];
      const unit1 = list.filter(c => c.day <= 3);
      const unit2 = list.filter(c => c.day > 3 && c.day <= 5);
      
      this.setData({
        courseList: list,
        unit1: unit1.length > 0 ? unit1 : this.getDefaultUnit1(),
        unit2: unit2.length > 0 ? unit2 : this.getDefaultUnit2(),
        loading: false
      });
    } catch (e) {
      // 使用默认数据
      this.setData({
        courseList: [],
        unit1: this.getDefaultUnit1(),
        unit2: this.getDefaultUnit2(),
        loading: false
      });
    }
  },
  
  // 默认Unit1数据
  getDefaultUnit1() {
    return [
      { id: 1, name: '嗨，新朋友', desc: '与新朋友进行简单的自我介绍', day: 1, free: true, completed: false },
      { id: 2, name: '自我介绍', desc: '学习如何用日语进行简单的自我介绍', day: 2, completed: false },
      { id: 3, name: '我的好朋友', desc: '介绍你的好朋友并谈论你们的友谊', day: 3, completed: false }
    ];
  },
  
  // 默认Unit2数据
  getDefaultUnit2() {
    return [
      { id: 4, name: '身边的颜色', desc: '学习描述和识别身边的颜色', day: 4, completed: false },
      { id: 5, name: '数数', desc: '学习基本的数数技巧，掌握从1到100', day: 5, completed: false }
    ];
  },
  
  // 刷新学习进度
  async refreshProgress() {
    try {
      const { get } = require('../../utils/request.js');
      const data = await get(course.progress);
      
      // 更新进度状态
      if (data && data.completedIds) {
        const completedIds = data.completedIds;
        this.setData(prev => ({
          courseList: prev.courseList.map(item => ({
            ...item,
            completed: completedIds.includes(item.id)
          })),
          unit1: prev.unit1.map(item => ({
            ...item,
            completed: completedIds.includes(item.id)
          })),
          unit2: prev.unit2.map(item => ({
            ...item,
            completed: completedIds.includes(item.id)
          }))
        }));
      }
    } catch (e) {
      console.error('获取进度失败', e);
    }
  },
  
  // 点击课程
  onCourseTap(e) {
    const { id } = e.currentTarget.dataset;
    const courseItem = this.data.courseList.find(item => item.id === id);
    
    if (!courseItem) {
      // 从 unit1/unit2 中查找
      const allCourses = [...(this.data.unit1 || []), ...(this.data.unit2 || [])];
      const item = allCourses.find(item => item.id === id);
      if (item) {
        wx.navigateTo({
          url: `/pages/chat/chat?courseId=${id}&title=${encodeURIComponent(item.name)}`
        });
      }
      return;
    }
    
    wx.navigateTo({
      url: `/pages/chat/chat?courseId=${id}&title=${encodeURIComponent(courseItem.name)}`
    });
  },
  
  // 加载更多
  loadMore() {
    if (this.data.loadingMore || !this.data.hasMore) return;
    
    this.setData({ loadingMore: true });
    
    setTimeout(() => {
      this.setData({
        hasMore: false,
        loadingMore: false
      });
    }, 1000);
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: '小语笔记 - 情景口语课',
      path: '/pages/course/course'
    };
  }
});
