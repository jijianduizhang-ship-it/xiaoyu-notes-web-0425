<template>
  <div class="scene-page">
    <!-- 返回 -->
    <div class="back-bar" @click="router.back()">
      <span class="back-icon">←</span>
      <span>返回场景</span>
    </div>

    <!-- 场景信息 -->
    <div class="scene-info" v-if="scene">
      <div class="scene-emoji">{{ sceneEmoji(scene.category) }}</div>
      <div class="scene-text">
        <h2 class="scene-title">{{ scene.title }}</h2>
        <p class="scene-desc">{{ scene.description }}</p>
      </div>
      <button class="btn-fav" @click="toggleFav">
        {{ favorited ? '❤️' : '🤍' }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- 消息列表 -->
    <div class="messages" ref="msgList">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="message-item"
        :class="msg.role"
      >
        <div class="msg-avatar">{{ msg.role === 'user' ? '😊' : '🤖' }}</div>
        <div class="msg-bubble">
          <div class="msg-content">{{ msg.content }}</div>
          <div class="msg-cn" v-if="msg.cn_content">{{ msg.cn_content }}</div>
        </div>
      </div>

      <!-- AI 思考中 -->
      <div v-if="thinking" class="message-item assistant">
        <div class="msg-avatar">🤖</div>
        <div class="msg-bubble">
          <div class="thinking-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示语 -->
    <div class="hints" v-if="!messages.length && !loading">
      <p class="hint-text">💬 试着说一句吧，AI 会帮你纠正和改进</p>
      <div class="hint-examples">
        <div class="hint-label">比如：</div>
        <div
          v-for="hint in exampleHints"
          :key="hint"
          class="hint-chip"
          @click="sendQuick(hint)"
        >{{ hint }}</div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="input-area">
      <div class="level-select" v-if="showLevel">
        <select v-model="currentLevel">
          <option value="1">初级</option>
          <option value="2">中级</option>
          <option value="3">高级</option>
        </select>
      </div>
      <input
        v-model="inputText"
        class="chat-input"
        placeholder="输入你想说的话..."
        @keyup.enter="sendMessage"
        :disabled="thinking"
      />
      <button class="btn-send" @click="sendMessage" :disabled="!inputText.trim() || thinking">
        {{ thinking ? '...' : '➤' }}
      </button>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="toast">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const loading = ref(true)
const messages = ref([])
const inputText = ref('')
const thinking = ref(false)
const favorited = ref(false)
const currentLevel = ref(1)
const showLevel = ref(true)
const msgList = ref(null)
const toast = ref({ show: false, msg: '' })

const scene = computed(() => user.currentScene)
const sceneId = computed(() => route.params.id)
const currentLang = computed(() => user.currentLang)

const exampleHints = [
  '你好，很高兴认识你',
  '请问这个多少钱？',
  '我想要...',
]

function sceneEmoji(category) {
  const map = {
    travel: '✈️', shopping: '🛍️', medical: '🏥', academic: '🎓',
    romance: '💕', food: '🍜', work: '💼', daily: '🏠',
  }
  return map[category] || '💬'
}

function showToast(msg) {
  toast.value = { show: true, msg }
  setTimeout(() => { toast.value.show = false }, 2000)
}

async function loadHistory() {
  try {
    const history = await user.fetchChatHistory(sceneId.value)
    messages.value = history
  } catch (e) {
    // 忽略
  }
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || thinking.value) return

  // 显示用户消息
  messages.value.push({ role: 'user', content: text, cn_content: '' })
  inputText.value = ''
  scrollToBottom()

  thinking.value = true

  try {
    const res = await user.sendChat(text, sceneId.value, currentLang.value, currentLevel.value)
    if (res.data) {
      messages.value.push({ role: 'assistant', content: res.data.text || res.data.content || '', cn_content: res.data.cn || res.data.cn_content || '' })
    }
  } catch (e) {
    messages.value.push({
      role: 'assistant',
      content: '抱歉，AI 暂时无法回复，请稍后重试。',
      cn_content: '',
    })
  } finally {
    thinking.value = false
    scrollToBottom()
  }
}

function sendQuick(text) {
  inputText.value = text
  sendMessage()
}

async function toggleFav() {
  favorited.value = !favorited.value
  showToast(favorited.value ? '已收藏 🌟' : '已取消收藏')
}

function scrollToBottom() {
  nextTick(() => {
    if (msgList.value) {
      msgList.value.scrollTop = msgList.value.scrollHeight
    }
  })
}

onMounted(async () => {
  loading.value = true
  await user.fetchSceneDetail(route.params.id)
  await loadHistory()
  loading.value = false
  scrollToBottom()
})
</script>

<style scoped>
.scene-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
}

.back-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 0;
  font-size: 14px;
  color: #667eea;
  cursor: pointer;
  flex-shrink: 0;
}

.back-icon { font-size: 18px; }

.scene-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.scene-emoji { font-size: 32px; }

.scene-text { flex: 1; }

.scene-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
}

.scene-desc {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 2px;
}

.btn-fav {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

.message-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.msg-bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
}

.message-item.user .msg-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-item.assistant .msg-bubble {
  background: white;
  color: #2d3748;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.msg-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.msg-cn {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.thinking-dots {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.thinking-dots span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #cbd5e0;
  animation: bounce 1.2s infinite;
}

.thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
.thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.hints {
  flex-shrink: 0;
  padding: 12px 0;
}

.hint-text {
  font-size: 13px;
  color: #a0aec0;
  text-align: center;
  margin-bottom: 12px;
}

.hint-examples {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hint-label {
  font-size: 12px;
  color: #cbd5e0;
  text-align: center;
}

.hint-chip {
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  color: #4a5568;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
}

.hint-chip:active {
  background: #f7fafc;
  border-color: #667eea;
}

.input-area {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
  background: var(--bg-light);
}

.level-select select {
  padding: 10px 8px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  background: white;
  outline: none;
  color: #4a5568;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 24px;
  font-size: 15px;
  outline: none;
  background: white;
}

.chat-input:focus {
  border-color: #667eea;
}

.btn-send {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
