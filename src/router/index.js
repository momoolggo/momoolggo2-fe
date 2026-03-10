import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    // ── 인증
    { path: '/signin',          component: () => import('@/views/SigninView.vue') },
    { path: '/signup',          component: () => import('@/views/SignupView.vue') },
    
    // ── 고객 메인 (추후 구현)
    { path: '/',                component: () => import('@/views/HomeView.vue') },

    // ── 사장 (추후 구현)
    { path: '/owner',           component: () => import('@/views/owner/OwnerHomeView.vue') },

    // ── 관리자 (추후 구현)
    { path: '/admin',           component: () => import('@/views/admin/AdminHomeView.vue') },

    // ── 존재하지 않는 경로는 로그인으로
    { path: '/:pathMatch(.*)*', redirect: '/signin' },
  ],
})

export default router