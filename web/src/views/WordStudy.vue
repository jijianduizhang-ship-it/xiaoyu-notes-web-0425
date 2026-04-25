<template>
  <div>
    <!-- 返回 -->
    <div class="back-bar" @click="router.back()">
      <span class="back-icon">←</span>
      <span>返回单词本</span>
    </div>

    <!-- 书名 -->
    <div class="book-header">
      <div class="book-icon">{{ bookIcon }}</div>
      <div>
        <h1 class="book-title">{{ bookName }}</h1>
        <p class="book-count">共 {{ totalCount }} 词</p>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- 单词卡片 -->
    <div v-else-if="words.length" class="flashcard-area">
      <!-- 进度 -->
      <div class="study-progress">
        <span>{{ currentIndex + 1 }} / {{ words.length }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: ((currentIndex + 1) / words.length * 100) + '%' }"></div>
        </div>
      </div>

      <!-- 卡片 -->
      <div class="flashcard" :class="{ flipped: showAnswer }" @click="flipCard">
        <div class="card-front" v-if="!showAnswer">
          <div class="card-word">{{ currentWord?.word }}</div>
          <div class="card-hint">点击查看释义</div>
        </div>
        <div class="card-back" v-else>
          <div class="card-pron">{{ currentWord?.pronunciation }}</div>
          <div class="card-meaning">{{ currentWord?.meaning }}</div>
          <div class="card-example" v-if="currentWord?.example">
            <div class="ex-label">例句</div>
            <div class="ex-original">{{ currentWord.example }}</div>
            <div class="ex-trans">{{ currentWord.translation }}</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="card-actions" v-if="showAnswer">
        <button class="btn-forgot" @click.stop="nextWord(false)">
          😵 模糊
        </button>
        <button class="btn-remember" @click.stop="nextWord(true)">
          ✅ 记得
        </button>
      </div>

      <!-- 生词本按钮 -->
      <div class="favorite-bar">
        <button class="btn-favorite" @click.stop="toggleFavorite">
          {{ isFavorited ? '⭐ 已收藏' : '☆ 收藏单词' }}
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📭</div>
      <p>该单词书暂无单词</p>
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
const currentIndex = ref(0)
const showAnswer = ref(false)
const words = ref([])
const totalCount = ref(0)
const toast = ref({ show: false, msg: '' })

const bookName = computed(() => {
  const book = user.wordBooks.find(b => b.id == route.params.id)
  return book?.name || '单词本'
})

const bookIcon = computed(() => {
  const book = user.wordBooks.find(b => b.id == route.params.id)
  const map = { book: '📚', star: '⭐', fire: '🔥', file: '📄' }
  return map[book?.icon] || '📚'
})

const currentWord = computed(() => words.value[currentIndex.value])

const isFavorited = computed(() => false) // 简化处理

function showToast(msg) {
  toast.value = { show: true, msg }
  setTimeout(() => { toast.value.show = false }, 2000)
}

function flipCard() {
  showAnswer.value = !showAnswer.value
}

function nextWord(remembered) {
  showAnswer.value = false
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++
  } else {
    showToast('🎉 本轮学习完成！')
    currentIndex.value = 0
  }
}

function toggleFavorite() {
  showToast('已收藏')
}

onMounted(async () => {
  loading.value = true
  await user.fetchWordBooks()
  const list = await user.fetchWordList(route.params.id)
  words.value = list
  totalCount.value = list.length
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
  margin-bottom: 12px;
}

.back-icon { font-size: 18px; }

.book-header {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 20px;
}

.book-icon { font-size: 40px; }

.book-title {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
}

.book-count {
  font-size: 13px;
  color: #a0aec0;
  margin-top: 2px;
}

.study-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #718096;
}

.study-progress .progress-bar {
  flex: 1;
}

.flashcard {
  background: white;
  border-radius: 20px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.12);
  cursor: pointer;
  transition: transform 0.3s;
  margin-bottom: 16px;
  text-align: center;
}

.flashcard:active {
  transform: scale(0.99);
}

.card-word {
  font-size: 36px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
}

.card-hint {
  font-size: 13px;
  color: #a0aec0;
}

.card-pron {
  font-size: 18px;
  color: #667eea;
  margin-bottom: 10px;
}

.card-meaning {
  font-size: 22px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
}

.card-example {
  background: rgba(102, 126, 234, 0.06);
  border-radius: 10px;
  padding: 12px 14px;
  text-align: left;
  width: 100%;
}

.ex-label {
  font-size: 11px;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 6px;
}

.ex-original {
  font-size: 13px;
  color: #2d3748;
  margin-bottom: 4px;
  line-height: 1.5;
}

.ex-trans {
  font-size: 12px;
  color: #718096;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.btn-forgot, .btn-remember {
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}

.btn-forgot {
  background: #fff5f5;
  color: #e53e3e;
  border: 1.5px solid #feb2b2;
}

.btn-remember {
  background: #f0fff4;
  color: #38a169;
  border: 1.5px solid #9ae6b4;
}

.btn-favorite {
  width: 100%;
  padding: 12px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #718096;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state p { font-size: 14px; color: #a0aec0; }
</style>
