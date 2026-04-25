import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '../api'

export const useUserStore = defineStore('user', () => {
  const info = ref(null)
  const stats = ref(null)
  const vipStatus = ref(null)
  const courses = ref([])
  const wordBooks = ref([])
  const scenes = ref([])
  const vipPackages = ref([])
  const currentLang = ref('korean')
  const courseProgress = ref({})
  const wordList = ref([])
  const currentBookId = ref(null)
  const currentCourseId = ref(null)
  const currentCourse = ref(null)
  const currentScene = ref(null)
  const chatMessages = ref([])
  const sceneConfig = ref(null)

  async function fetchInfo() {
    try {
      const res = await userApi.getInfo()
      info.value = res.data
    } catch (e) {}
  }

  async function fetchStats() {
    try {
      const res = await userApi.getStats()
      stats.value = res.data
    } catch (e) {}
  }

  async function fetchVipStatus() {
    try {
      const res = await userApi.getVipStatus()
      vipStatus.value = res.data
    } catch (e) {}
  }

  async function fetchCourses(lang = 'korean') {
    const res = await userApi.getCourses(lang)
    courses.value = res.data?.list || []
  }

  async function fetchCourseDetail(id) {
    currentCourseId.value = id
    const res = await userApi.getCourseDetail(id)
    currentCourse.value = res.data
    return res.data
  }

  async function fetchCourseProgress() {
    try {
      const res = await userApi.getCourseProgress()
      const map = {}
      ;(res.data?.list || []).forEach(p => { map[p.course_id] = p })
      courseProgress.value = map
    } catch (e) {}
  }

  async function saveProgress(courseId, status = 1) {
    const res = await userApi.saveProgress(courseId, status)
    courseProgress.value[courseId] = { ...courseProgress.value[courseId], status }
    return res
  }

  async function fetchWordBooks(lang = 'korean') {
    const res = await userApi.getWordBooks(lang)
    wordBooks.value = res.data?.list || []
  }

  async function fetchWordList(bookId, page = 1) {
    currentBookId.value = bookId
    const res = await userApi.getWordList(bookId, page)
    wordList.value = res.data?.list || []
    return wordList.value
  }

  async function fetchScenes(lang = 'korean') {
    const res = await userApi.getScenes(lang)
    scenes.value = res.data?.list || []
  }

  async function fetchSceneDetail(id) {
    const res = await userApi.getSceneDetail(id)
    currentScene.value = res.data
    return res.data
  }

  async function fetchSceneConfig(sceneId) {
    const res = await userApi.getSceneConfig(sceneId)
    sceneConfig.value = res.data
    return res.data
  }

  async function fetchChatHistory(sceneId) {
    const res = await userApi.getChatHistory(sceneId)
    chatMessages.value = res.data?.list || []
    return chatMessages.value
  }

  async function sendChat(message, sceneId, lang, level) {
    const res = await userApi.sendChat(message, sceneId, lang, level)
    if (res.data) {
      chatMessages.value.push(res.data)
    }
    return res
  }

  async function fetchVipPackages() {
    const res = await userApi.getVipPackages()
    vipPackages.value = res.data || []
  }

  async function fetchMyVip() {
    const res = await userApi.getMyVip()
    return res.data
  }

  return {
    info,
    stats,
    vipStatus,
    courses,
    wordBooks,
    scenes,
    vipPackages,
    currentLang,
    courseProgress,
    wordList,
    currentBookId,
    currentCourseId,
    currentScene,
    chatMessages,
    sceneConfig,
    fetchInfo,
    fetchStats,
    fetchVipStatus,
    fetchCourses,
    fetchCourseDetail,
    fetchCourseProgress,
    saveProgress,
    fetchWordBooks,
    fetchWordList,
    fetchScenes,
    fetchSceneDetail,
    fetchSceneConfig,
    fetchChatHistory,
    sendChat,
    fetchVipPackages,
    fetchMyVip,
  }
})
