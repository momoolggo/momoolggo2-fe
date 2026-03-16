import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// ── 공통
import LandingView from '@/views/LandingView.vue'
import StoreListView from '@/views/store/StoreListView.vue'
import StoreDetailView from '@/views/store/StoreDetailView.vue'

// ── 사장님
import OwnerSigninView  from '@/views/owner/OwnerSigninView.vue'
import OwnerSignupView  from '@/views/owner/OwnerSignupView.vue'
import OwnerOrderView   from '@/views/owner/OwnerOrderView.vue'
import AddStoreView     from '@/views/owner/AddStoreView.vue'

// ── 고객
import CustomerSigninView from '@/views/customer/CustomerSigninView.vue'
import CustomerSignupView from '@/views/customer/CustomerSignupView.vue'
import HomeView           from '@/views/HomeView.vue'
import MyPageView         from '@/views/mypage/MyPageView.vue'
import MyPageProfileView  from '@/views/mypage/MyPageProfileView.vue'
import MyPageAddressView  from '@/views/mypage/MyPageAddressView.vue'
import MyPageOrdersView   from '@/views/mypage/MyPageOrdersView.vue'
import MyPageCouponView   from '@/views/mypage/MyPageCouponView.vue'
import MyPageReviewView   from '@/views/mypage/MyPageReviewView.vue'
import MyPageCsView       from '@/views/mypage/MyPageCsView.vue'
import CartView           from '@/views/servicee/CartView.vue'
import FavoriteView       from '@/views/servicee/FavoriteView.vue'
import OrderView          from '@/views/servicee/OrderView.vue'
import EventView          from '@/views/servicee/EventView.vue'
import WhatKindView       from '@/views/servicee/WhatKindView.vue'

const routes = [
  { path: '/', name: 'Landing', component: LandingView },
  { path: '/storelist', name: 'StoreList', component: StoreListView, meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/store/:id', name: 'StoreDetail', component: StoreDetailView, meta: { requiresAuth: true, role: 'CUSTOMER' } },

  // ── 사장님 인증
  { path: '/owner/signin', name: 'OwnerSignin', component: OwnerSigninView, meta: { guestOnly: true } },
  { path: '/owner/signup', name: 'OwnerSignup', component: OwnerSignupView, meta: { guestOnly: true } },

  // ── 고객 인증
  { path: '/customer/signin', name: 'CustomerSignin', component: CustomerSigninView, meta: { guestOnly: true } },
  { path: '/customer/signup', name: 'CustomerSignup', component: CustomerSignupView, meta: { guestOnly: true } },

  // ── 고객 전용
  { path: '/home', name: 'Home', component: HomeView, meta: { requiresAuth: true, role: 'CUSTOMER' } },
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPageView,
    meta: { requiresAuth: true, role: 'CUSTOMER' },
    children: [
      { path: 'profile', name: 'MyPageProfile', component: MyPageProfileView },
      { path: 'address', name: 'MyPageAddress', component: MyPageAddressView },
      { path: 'orders',  name: 'MyPageOrders',  component: MyPageOrdersView  },
      { path: 'coupon',  name: 'MyPageCoupon',  component: MyPageCouponView  },
      { path: 'review',  name: 'MyPageReview',  component: MyPageReviewView  },
      { path: 'cs',      name: 'MyPageCs',      component: MyPageCsView      },
    ],
  },
  { path: '/cart',     name: 'Cart',     component: CartView,     meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/favorite', name: 'Favorite', component: FavoriteView, meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/order',    name: 'Order',    component: OrderView,    meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/event',    name: 'Event',    component: EventView,    meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/whatkind', name: 'WhatKind', component: WhatKindView, meta: { requiresAuth: true, role: 'CUSTOMER' } },
  {path: '/payment/success', name: 'PaymentSuccess', component: () => import('@/views/servicee/PaySuccess.vue'), meta: { requiresAuth: true, role: 'CUSTOMER' } },
  {path: '/payment/fail', name: 'PaymentFailure', component: () => import('@/views/servicee/PayFail.vue'), meta: { requiresAuth: true, role: 'CUSTOMER' } },

  // ── 사장님 전용
  { path: '/ownerservice', name: 'OwnerService', component: OwnerOrderView, meta: { requiresAuth: true, role: 'OWNER' } },
  { path: '/ownerservice/addstore', name: 'AddStore', component: AddStoreView, meta: { requiresAuth: true, role: 'OWNER' } },

  // ── 404 → 랜딩으로
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ── 라우터 가드
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (userStore.state.isLoading) {
    await userStore.checkAuth()
  }

  const isSignedIn = userStore.state.isSignedIn
  const role       = userStore.state.role

  if (to.meta.guestOnly && isSignedIn) {
    if (role === 'OWNER') return next('/ownerservice')
    if (role === 'RIDER') return next('/riderservice')
    return next('/home')
  }

  if (to.meta.requiresAuth) {
    if (!isSignedIn) {
      if (to.meta.role === 'OWNER') return next('/owner/signin')
      if (to.meta.role === 'RIDER') return next('/rider/signin')
      return next('/customer/signin')
    }

    if (to.meta.role && to.meta.role !== role) {
      if (role === 'OWNER') return next('/ownerservice')
      if (role === 'RIDER') return next('/riderservice')
      return next('/home')
    }
  }

  next()
})

export default router
