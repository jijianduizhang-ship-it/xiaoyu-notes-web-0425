<template>
  <div>
    <!-- 语言切换 -->
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

    <!-- 加载中 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- 课程列表 -->
    <div v-else>
      <div v-for="(items, unit) in groupedCourses" :key="unit" class="unit-section">
        <div class="unit-title">{{ unit }}</div>
        <div class="course-list">
          <div
            v-for="course in items"
            :key="course.id"
            class="course-item"
            @click="goCourse(course)"
          >
            <div class="course-info">
              <div class="course-name">
                {{ course.name }}
                <span class="tag tag-primary" v-if="course.free">免费</span>
              </div>
              <div class="course-desc">{{ course.desc }}</div>
              <div class="course-meta">
                <span>⏱ {{ course.day }}天</span>
              </div>
            </div>
            <div class="course-arrow">&gt;</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const groupedCourses = computed(() => {
  const groups = {}
  user.courses.forEach(course => {
    if (!groups[course.unit]) groups[course.unit] = []
    groups[course.unit].push(course)
  })
  return groups
})

async function switchLang(lang) {
  currentLang.value = lang
  user.currentLang = lang
  loading.value = true
  await user.fetchCourses(lang)
  loading.value = false
}

function goCourse(course) {
  router.push(`/course/${course.id}`)
  user.currentCourseId = course.id
}

onMounted(async () => {
  loading.value = true
  await user.fetchCourses(currentLang.value)
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

.unit-section {
  margin-bottom: 24px;
}

.unit-title {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 10px;
  padding-left: 4px;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-item {
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.15s;
}

.course-item:active {
  transform: scale(0.98);
}

.course-name {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.course-desc {
  font-size: 13px;
  color: #a0aec0;
  margin-bottom: 4px;
}

.course-meta {
  font-size: 12px;
  color: #cbd5e0;
}

.course-arrow {
  color: #cbd5e0;
  font-size: 18px;
}
</style>
