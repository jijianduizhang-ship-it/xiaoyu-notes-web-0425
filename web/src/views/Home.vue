<template>
  <div>
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <div class="avatar">{{ userInitial }}</div>
        <div>
          <div class="username">{{ auth.userInfo.nickname || '管理员' }}</div>
          <div class="user-level">Lv.{{ stats?.level || 1 }} · {{ langLabel }}</div>
        </div>
      </div>
      <router-link to="/vip" class="vip-btn" v-if="!stats?.is_vip">
        <span>开通VIP</span>
      </router-link>
      <div class="vip-badge" v-else>⭐ VIP会员</div>
    </div>

    <!-- 学习数据 -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-num">{{ stats?.totalMinutes || 0 }}</div>
        <div class="stat-label">累计学习(分钟)</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ stats?.todayMinutes || 0 }}</div>
        <div class="stat-label">今日学习(分钟)</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ stats?.wordsCount || 0 }}</div>
        <div class="stat-label">已学单词</div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-entry">
      <div class="section-title">开始学习</div>
      <div class="entry-grid">
        <router-link to="/courses" class="entry-item">
          <div class="entry-icon" style="background: rgba(102, 126, 234, 0.1)">📖</div>
          <span>课程学习</span>
        </router-link>
        <router-link to="/words" class="entry-item">
          <div class="entry-icon" style="background: rgba(118, 75, 162, 0.1)">✏️</div>
          <span>背单词</span>
        </router-link>
        <router-link to="/scenes" class="entry-item">
          <div class="entry-icon" style="background: rgba(255, 107, 107, 0.1)">💬</div>
          <span>场景对话</span>
        </router-link>
        <router-link to="/vip" class="entry-item">
          <div class="entry-icon" style="background: rgba(255, 215, 0, 0.1)">👑</div>
          <span>开通会员</span>
        </router-link>
      </div>
    </div>

    <!-- 热门场景 -->
    <div class="hot-section">
      <div class="section-header">
        <span class="section-title">🔥 热门场景</span>
        <router-link to="/scenes" class="more-link">更多 &gt;</router-link>
      </div>
      <div class="scene-list">
        <div v-for="scene in hotScenes" :key="scene.id" class="scene-card" @click="goScene(scene)">
          <div class="scene-title">{{ scene.title }}</div>
          <div class="scene-desc">{{ scene.description }}</div>
          <div class="scene-meta">
            <span class="view-count">👁 {{ scene.count || 0 }}</span>
            <span class="tag tag-hot" v-if="scene.hot">热门</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'

const router = useRouter()
const auth = useAuthStore()
const user = useUserStore()

const stats = computed(() => user.stats)

const userInitial = computed(() => {
  const name = auth.userInfo.nickname || 'A'
  return name.charAt(0).toUpperCase()
})

const langLabel = computed(() => {
  const map = { korean: '韩语', japanese: '日语', english: '英语' }
  return map[user.currentLang] || '韩语'
})

const hotScenes = computed(() => user.scenes.filter(s => s.hot).slice(0, 3))

onMounted(async () => {
  await Promise.all([
    user.fetchStats(),
    user.fetchScenes(),
    user.fetchCourses(),
    user.fetchWordBooks(),
  ])
})

function goScene(scene) {
  router.push(`/scene/${scene.id}`)
}
</script>

<style scoped>
.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.username {
  font-size: 17px;
  font-weight: 600;
}

.user-level {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 2px;
}

.vip-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  color: white;
  text-decoration: none;
}

.vip-badge {
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  color: #ffd700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  background: white;
  border-radius: 12px;
  padding: 14px 8px;
  text-align: center;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 11px;
  color: #a0aec0;
  margin-top: 2px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.more-link {
  font-size: 13px;
  color: #a0aec0;
  text-decoration: none;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.entry-item {
  background: white;
  border-radius: 12px;
  padding: 14px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  font-size: 12px;
  color: #4a5568;
  transition: transform 0.15s;
}

.entry-item:active {
  transform: scale(0.95);
}

.entry-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.scene-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scene-card {
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: transform 0.15s;
}

.scene-card:active {
  transform: scale(0.98);
}

.scene-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.scene-desc {
  font-size: 13px;
  color: #a0aec0;
  margin-bottom: 8px;
}

.scene-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-count {
  font-size: 12px;
  color: #cbd5e0;
}
</style>
