<template>
  <div>
    <!-- 返回 -->
    <div class="back-bar" @click="router.back()">
      <span class="back-icon">←</span>
      <span>返回课程</span>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="course" class="course-detail">
      <!-- 课程头部 -->
      <div class="course-header">
        <div class="course-tag" v-if="course.isFree">
          <span class="tag tag-primary">免费</span>
        </div>
        <h1 class="course-title">{{ course.name }}</h1>
        <p class="course-desc">{{ course.description }}</p>
        <div class="course-meta">
          <span>📅 {{ course.day }}天课程</span>
          <span>📚 {{ course.lang }}</span>
        </div>
      </div>

      <!-- 学习按钮 -->
      <div class="study-action" v-if="course.isFree || stats?.isVip">
        <button class="btn-primary study-btn" @click="startStudy">
          {{ progressStatus === 2 ? '🔄 重新学习' : '▶️ 开始学习' }}
        </button>
      </div>
      <div class="vip-lock" v-else>
        <p>开通VIP解锁此课程</p>
        <button class="btn-vip" @click="router.push('/vip')">开通VIP</button>
      </div>

      <!-- 进度信息 -->
      <div class="progress-section" v-if="progressStatus">
        <div class="progress-label">
          <span>学习进度</span>
          <span>{{ progressStatus === 2 ? '已完成 ✅' : '学习中...' }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressStatus === 2 ? '100%' : '50%' }"></div>
        </div>
      </div>

      <!-- 学习内容（展开后） -->
      <div class="study-content" v-if="studying">
        <div class="content-card">
          <div class="content-label">📝 学习内容</div>
          <p class="content-text">{{ course.description }}</p>
          <div class="tips">
            <div class="tip-title">💡 学习建议</div>
            <ul class="tip-list">
              <li>每天学习 1-2 个新表达</li>
              <li>尝试用今天学的表达自己造句</li>
              <li>大声朗读，练习发音</li>
            </ul>
          </div>
        </div>

        <!-- AI 练习入口 -->
        <div class="ai-practice" @click="goPractice">
          <div class="ai-icon">🤖</div>
          <div class="ai-info">
            <div class="ai-title">AI 口语陪练</div>
            <div class="ai-desc">和 AI 一起练习本课内容</div>
          </div>
          <div class="ai-arrow">&gt;</div>
        </div>

        <button class="btn-complete" @click="markComplete" v-if="progressStatus !== 2">
          ✅ 完成课程
        </button>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="toast">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const loading = ref(true)
const course = ref(null)
const studying = ref(false)
const toast = ref({ show: false, msg: '' })

const stats = computed(() => user.stats)

const progressStatus = computed(() => {
  return user.courseProgress[course.value?.id]?.status || 0
})

function showToast(msg) {
  toast.value = { show: true, msg }
  setTimeout(() => { toast.value.show = false }, 2000)
}

async function startStudy() {
  if (course.value) {
    await user.saveProgress(course.value.id, 1)
    studying.value = true
  }
}

async function markComplete() {
  await user.saveProgress(course.value.id, 2)
  studying.value = false
  showToast('🎉 课程已完成！')
}

function goPractice() {
  router.push(`/scene/${course.value?.id}`)
}

onMounted(async () => {
  loading.value = true
  course.value = await user.fetchCourseDetail(route.params.id)
  await user.fetchCourseProgress()
  loading.value = false
})
</script>

<style scoped>
.back-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
  font-size: 14px;
  color: #667eea;
  cursor: pointer;
  margin-bottom: 8px;
}

.back-icon {
  font-size: 18px;
}

.course-header {
  background: white;
  border-radius: 16px;
  padding: 24px 20px;
  margin-bottom: 16px;
}

.course-tag {
  margin-bottom: 10px;
}

.course-title {
  font-size: 22px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 10px;
}

.course-desc {
  font-size: 14px;
  color: #718096;
  line-height: 1.6;
  margin-bottom: 14px;
}

.course-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #a0aec0;
}

.study-btn {
  margin-bottom: 16px;
}

.vip-lock {
  background: linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08));
  border: 1.5px solid rgba(102,126,234,0.2);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  margin-bottom: 16px;
}

.vip-lock p {
  font-size: 14px;
  color: #667eea;
  margin-bottom: 10px;
}

.btn-vip {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.progress-section {
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #718096;
  margin-bottom: 8px;
}

.study-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 18px 16px;
}

.content-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
}

.content-text {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.7;
  margin-bottom: 14px;
}

.tips {
  background: rgba(102, 126, 234, 0.06);
  border-radius: 10px;
  padding: 12px 14px;
}

.tip-title {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 8px;
}

.tip-list {
  font-size: 13px;
  color: #4a5568;
  padding-left: 16px;
  line-height: 1.8;
}

.ai-practice {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: transform 0.15s;
}

.ai-practice:active {
  transform: scale(0.98);
}

.ai-icon {
  font-size: 32px;
}

.ai-info {
  flex: 1;
}

.ai-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2px;
}

.ai-desc {
  font-size: 12px;
  color: #a0aec0;
}

.ai-arrow {
  color: #cbd5e0;
  font-size: 18px;
}

.btn-complete {
  width: 100%;
  padding: 14px;
  background: white;
  border: 1.5px solid #667eea;
  border-radius: 12px;
  color: #667eea;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-complete:active {
  background: rgba(102, 126, 234, 0.06);
}
</style>
