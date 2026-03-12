import { createRouter, createWebHistory } from 'vue-router'
import MyPageView         from '@/views/mypage/MyPageView.vue'
import MyPageProfileView  from '@/views/mypage/MyPageProfileView.vue'
import MyPageAddressView  from '@/views/mypage/MyPageAddressView.vue'
import MyPageOrdersView   from '@/views/mypage/MyPageOrdersView.vue'
import MyPageReviewView   from '@/views/mypage/MyPageReviewView.vue'
import MyPageCouponView   from '@/views/mypage/MyPageCouponView.vue'
import MyPageCsView       from '@/views/mypage/MyPageCsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    // ── 인증
    { path: '/signin',          component: () => import('@/views/SigninView.vue') },
    { path: '/signup',          component: () => import('@/views/SignupView.vue') },
    
    // ── 고객 메인 (추후 구현)
    { path: '/',                component: () => import('@/views/HomeView.vue') },

    // ── 매장 목록
    { path: '/storelist',         component: () => import('@/views/StoreListView.vue') },
    
    { path: '/store/:id', 
      component: () => import('@/views/StoreDetailView.vue')},

    // ── 사장 (추후 구현)
    { path: '/ownerservice',     component: () => import('@/views/owner/OwnerOrderView.vue') },
    

    // ── 관리자 (추후 구현)
    { path: '/admin',           component: () => import('@/views/admin/AdminHomeView.vue') },

    // ── 관리자 (추후 구현)
    { path: '/rider',           component: () => import('@/views/rider/RiderHomeView.vue') },


    // ── 존재하지 않는 경로는 로그인으로
    { path: '/:pathMatch(.*)*', redirect: '/signin' },

    // 마이페이지
    { path: '/mypage',          component: MyPageView        },
    { path: '/mypage/profile',  component: MyPageProfileView },
    { path: '/mypage/address',  component: MyPageAddressView },
    { path: '/mypage/orders',   component: MyPageOrdersView  },
    { path: '/mypage/review',   component: MyPageReviewView  },
    { path: '/mypage/coupon',   component: MyPageCouponView  },
    { path: '/mypage/cs',       component: MyPageCsView      },
  ],
})

export default router