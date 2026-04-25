// API 基础配置
const BASE_URL = '/api'

// 通用请求方法
async function request(path, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json()

  if (!res.ok || (data.code !== 200 && data.code !== 401)) {
    throw new Error(data.msg || '请求失败')
  }

  if (data.code === 401) {
    throw new Error(data.msg || '请先登录')
  }

  return data
}

// 公开 API
export const publicApi = {
  // Web管理员登录
  adminLogin: (username, password) =>
    request('/user/admin-login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  // VIP测试账号登录
  vipLogin: () =>
    request('/user/vip-login', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
}

// 用户 API
export const userApi = {
  getInfo: () => request('/user/info'),
  getStats: () => request('/user/stats'),
  getVipStatus: () => request('/user/vip'),

  getCourses: (lang) => request(`/course/list?lang=${lang || 'korean'}`),
  getCourseDetail: (id) => request(`/course/detail?id=${id}`),
  getCourseProgress: () => request('/course/progress'),
  saveProgress: (courseId, status) =>
    request('/course/save-progress', {
      method: 'POST',
      body: JSON.stringify({ courseId, status }),
    }),

  getWordBooks: (lang) => request(`/word/books?lang=${lang || 'korean'}`),
  getWordList: (bookId, page = 1, pageSize = 50) =>
    request(`/word/list?bookId=${bookId}&page=${page}&pageSize=${pageSize}`),
  addWordFavorite: (wordId) =>
    request('/word/favor', { method: 'POST', body: JSON.stringify({ wordId }) }),
  getWordFavorites: () => request('/word/favorites'),

  getScenes: (lang) => request(`/scene/list?lang=${lang || 'korean'}`),
  getSceneDetail: (id) => request(`/scene/detail?id=${id}`),
  addSceneFavorite: (sceneId) =>
    request('/scene/favor', { method: 'POST', body: JSON.stringify({ sceneId }) }),
  getSceneFavorites: () => request('/scene/favorites'),

  // 注意: message 对应后端的 message 字段
  sendChat: (message, sceneId, lang, level) =>
    request('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message, sceneId, lang, level }),
    }),
  getChatHistory: (sceneId) => request(`/chat/history?sceneId=${sceneId}`),
  getSceneConfig: (sceneId) => request(`/chat/scene-config?sceneId=${sceneId}`),

  getVipPackages: () => request('/vip/packages'),
  getMyVip: () => request('/vip/my'),
  createOrder: (packageId) =>
    request('/vip/create-order', { method: 'POST', body: JSON.stringify({ package_id: packageId }) }),
}
