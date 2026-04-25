# 小语笔记 - 多语言口语学习小程序

> AI智能口语陪练小程序，支持韩语、日语、英语等多种语言的对话练习。

## 项目结构

```
weapp-xiaoyu/
├── app.js                 # 应用入口
├── app.json               # 全局配置
├── app.wxss               # 全局样式
├── siteinfo.js            # 站点配置
├── project.config.json    # 项目配置
├── sitemap.json           # SEO配置
│
├── utils/                 # 工具模块
│   ├── api.js            # API接口配置
│   ├── request.js        # HTTP请求封装
│   ├── auth.js           # 登录授权
│   ├── common.js         # 通用工具函数
│   └── constants.js      # 常量配置
│
└── pages/                 # 页面
    ├── index/            # 口语首页
    ├── course/           # 情景课
    ├── word/             # 单词
    ├── mine/             # 我的
    ├── language/         # 语种选择
    ├── chat/             # AI对话
    └── member/           # 会员中心
```

## 功能列表

### 已完成 ✅
- [x] 7个主要页面UI
- [x] 工具模块封装（request、auth、api）
- [x] 全局样式（渐变、卡片、按钮）
- [x] 页面跳转与数据传递
- [x] 本地存储（用户信息、学习设置）

### 待开发 🔧
- [ ] 后端API对接
- [ ] 微信登录授权
- [ ] AI对话功能（需对接大模型）
- [ ] 微信支付（会员购买）
- [ ] 单词发音功能
- [ ] 学习进度同步

## 后端接口

需要后端提供以下接口：

### 用户相关
- `POST /api/user/login` - 微信登录
- `GET /api/user/info` - 获取用户信息
- `POST /api/user/update` - 更新用户信息

### 课程相关
- `GET /api/course/list` - 课程列表
- `GET /api/course/detail` - 课程详情
- `GET /api/course/progress` - 学习进度

### 单词相关
- `GET /api/word/books` - 单词书列表
- `GET /api/word/list` - 单词列表

### 场景相关
- `GET /api/scene/list` - 场景列表
- `GET /api/scene/detail` - 场景详情

### AI对话
- `POST /api/chat/send` - 发送消息
- `GET /api/chat/history` - 对话历史

### 会员相关
- `GET /api/vip/packages` - 套餐列表
- `POST /api/vip/create-order` - 创建订单
- `GET /api/vip/my` - 我的会员

## 使用说明

### 1. 导入项目
1. 下载微信开发者工具
2. 新建项目，选择 `weapp-xiaoyu` 目录
3. 填入 AppID（可在 siteinfo.js 中修改）

### 2. 配置后端
修改 `siteinfo.js` 中的 `apiBase` 为实际后端地址：
```javascript
apiBase: 'https://your-api-domain.com'
```

### 3. 开发阶段
- 设置 `debug: true` 可查看请求日志
- 使用测试号体验功能

## 技术栈

- **前端框架**: 原生微信小程序
- **UI组件**: Vant Weapp（可选）
- **后端**: Node.js + Express
- **数据库**: MySQL
- **AI**: 混元 / ChatGLM / Claude

## 截图预览

首页采用清新的绿色渐变配色，包含：
- 语伴切换功能
- 热门场景列表
- 学习数据统计
- AI对话入口

## License

MIT
