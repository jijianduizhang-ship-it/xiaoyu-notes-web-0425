<template>
  <div class="page">
    <!-- 顶部导航 -->
    <header class="top-nav">
      <div class="nav-inner">
        <span class="nav-title">{{ pageTitle }}</span>
      </div>
    </header>

    <!-- 页面内容 -->
    <main class="content">
      <router-view />
    </main>

    <!-- 底部标签栏 -->
    <nav class="tab-bar">
      <router-link to="/" class="tab-item" :class="{ active: route.path === '/' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        <span>首页</span>
      </router-link>

      <router-link to="/courses" class="tab-item" :class="{ active: route.path === '/courses' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <span>课程</span>
      </router-link>

      <router-link to="/words" class="tab-item" :class="{ active: route.path === '/words' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        <span>单词</span>
      </router-link>

      <router-link to="/scenes" class="tab-item" :class="{ active: route.path === '/scenes' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>场景</span>
      </router-link>

      <router-link to="/profile" class="tab-item" :class="{ active: route.path === '/profile' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  const map = {
    '/': '首页',
    '/courses': '课程学习',
    '/words': '单词本',
    '/scenes': '场景对话',
    '/vip': '会员中心',
    '/profile': '个人中心',
  }
  return map[route.path] || '小语笔记'
})
</script>

<style scoped>
.nav-inner {
  max-width: 480px;
  margin: 0 auto;
  padding: 14px 16px;
  text-align: center;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #2d3748;
}
</style>
