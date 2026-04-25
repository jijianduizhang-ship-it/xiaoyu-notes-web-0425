import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/Home.vue'),
      },
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('../views/Courses.vue'),
      },
      {
        path: 'course/:id',
        name: 'CourseDetail',
        component: () => import('../views/CourseDetail.vue'),
      },
      {
        path: 'words',
        name: 'Words',
        component: () => import('../views/Words.vue'),
      },
      {
        path: 'word/:id',
        name: 'WordStudy',
        component: () => import('../views/WordStudy.vue'),
      },
      {
        path: 'scenes',
        name: 'Scenes',
        component: () => import('../views/Scenes.vue'),
      },
      {
        path: 'scene/:id',
        name: 'SceneChat',
        component: () => import('../views/SceneChat.vue'),
      },
      {
        path: 'vip',
        name: 'VIP',
        component: () => import('../views/VIP.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.path !== '/login' && !auth.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && auth.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
