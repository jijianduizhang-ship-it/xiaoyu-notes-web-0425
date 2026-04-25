<template>
  <div>
    <div class="lang-tabs">
      <div
        v-for="lang in langs"
        :key="lang.value"
        class="lang-tab"
        :class="{ active: currentLang === lang.value }"
        @click="switchLang(lang.value)"
      >
        {{ lang.label }}
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="book-list">
      <div
        v-for="book in user.wordBooks"
        :key="book.id"
        class="book-item"
        @click="goBook(book)"
      >
        <div class="book-icon">{{ bookIcon(book.icon) }}</div>
        <div class="book-info">
          <div class="book-name">{{ book.name }}</div>
          <div class="book-desc">{{ book.desc || book.description }}</div>
          <div class="book-count">📖 {{ book.count }}词</div>
        </div>
        <div class="book-arrow">&gt;</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const user = useUserStore()

const loading = ref(false)
const currentLang = ref(user.currentLang)

const langs = [
  { label: '🇰🇷 韩语', value: 'korean' },
  { label: '🇯🇵 日语', value: 'japanese' },
  { label: '🇺🇸 英语', value: 'english' },
]

function bookIcon(icon) {
  const map = { book: '📚', star: '⭐', fire: '🔥', file: '📄' }
  return map[icon] || '📚'
}

async function switchLang(lang) {
  currentLang.value = lang
  user.currentLang = lang
  loading.value = true
  await user.fetchWordBooks(lang)
  loading.value = false
}

function goBook(book) {
  router.push(`/word/${book.id}`)
}

onMounted(async () => {
  loading.value = true
  await user.fetchWordBooks(currentLang.value)
  loading.value = false
})
</script>

<style scoped>
.lang-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.lang-tab {
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.book-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.book-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: transform 0.15s;
}

.book-item:active {
  transform: scale(0.98);
}

.book-icon {
  font-size: 36px;
  width: 52px;
  height: 52px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-info {
  flex: 1;
}

.book-name {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.book-desc {
  font-size: 13px;
  color: #a0aec0;
  margin-bottom: 4px;
}

.book-count {
  font-size: 12px;
  color: #cbd5e0;
}

.book-arrow {
  color: #cbd5e0;
  font-size: 20px;
}
</style>
