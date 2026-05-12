import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// ── 공통
import LandingView from '@/views/LandingView.vue'
import StoreListView from '@/views/store/StoreListView.vue'
import StoreDetailView from '@/views/store/StoreDetailView.vue'
import OwnerLandingView from '@/views/store/OwnerLandingView.vue'

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
import SearchStoreView    from '@/views/header/SearchStoreView.vue'
import NearbyView from '@/views/servicee/NearbyView.vue'

// ── 라이더
import RiderLandingView from '@/views/rider/RiderLandingView.vue'
import RiderSignupView from '@/views/rider/RiderSignupView.vue'
import RiderSigninView from '@/views/rider/RiderSigninView.vue'
import RiderHomeView   from '@/views/rider/RiderHomeView.vue'

// ── 관리자
import AdminHomeView from '@/views/admin/AdminHomeView.vue'
import AdminSettlementView from '@/views/admin/AdminSettlementView.vue'
import AdminBlindView from '@/views/admin/AdminBlindView.vue'
import AdminCsView from '@/views/admin/AdminCsView.vue'
import AdminDeliveryView from '@/views/admin/AdminDeliveryView.vue'

const routes = [
  { path: '/', name: 'Landing', component: LandingView },
  { path: '/ownerlanding', name: 'OwnerLanding', component: OwnerLandingView},
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

  // ── 관리자 전용
  { path: '/admin', name: 'AdminHome', component: AdminHomeView /*,  meta: { requiresAuth: true, role: 'ADMIN' }*/ },
  { path: '/admin/settlement', name: 'AdminSettlement', component: AdminSettlementView/*, meta: { requiresAuth: true, role: 'ADMIN' }*/ },
  { path: '/admin/blind', name: 'AdminBlind', component: AdminBlindView/*, meta: { requiresAuth: true, role: 'ADMIN' }*/ },
  { path: '/admin/cs', name: 'AdminCs', component: AdminCsView /*,  meta: { requiresAuth: true, role: 'ADMIN' }*/ },
  { path: '/admin/delivery', name: 'AdminDelivery', component: AdminDeliveryView/*,  meta: { requiresAuth: true, role: 'ADMIN' }*/  },


    // /mypage는 메뉴 페이지
{ path: '/mypage', name: 'MyPage', component: MyPageView, meta: { requiresAuth: true, role: 'CUSTOMER' } },

// 하위 페이지들은 독립 라우트
{ path: '/mypage/profile', name: 'MyPageProfile', component: MyPageProfileView, meta: { requiresAuth: true, role: 'CUSTOMER' } },
{ path: '/mypage/address', name: 'MyPageAddress', component: MyPageAddressView, meta: { requiresAuth: true, role: 'CUSTOMER' } },
{ path: '/mypage/orders',  name: 'MyPageOrders',  component: MyPageOrdersView,  meta: { requiresAuth: true, role: 'CUSTOMER' } },
{ path: '/mypage/coupon',  name: 'MyPageCoupon',  component: MyPageCouponView,  meta: { requiresAuth: true, role: 'CUSTOMER' } },
{ path: '/mypage/review',  name: 'MyPageReview',  component: MyPageReviewView,  meta: { requiresAuth: true, role: 'CUSTOMER' } },
{ path: '/mypage/cs',      name: 'MyPageCs',      component: MyPageCsView,      meta: { requiresAuth: true, role: 'CUSTOMER' } },

//고객 서비스
  {path: '/mypage/pet' , name: 'MyPagePet', component: () => import('@/views/servicee/PetView.vue') },
  {path: '/mypage/review/:id', name: 'ReviewDetail', component: () => import('@/views/mypage/ReviewPostView.vue'), meta: { requiresAuth: true} },
  {path: '/mypage/orders/:id', name: 'OrderDetail', component: () => import('@/views/mypage/OrderDetailView.vue'), meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/cart',     name: 'Cart',     component: CartView,     meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/favorite', name: 'Favorite', component: FavoriteView, meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/order',    name: 'Order',    component: OrderView,    meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/event',    name: 'Event',    component: EventView,    meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/whatkind', name: 'WhatKind', component: WhatKindView, meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/searchstore', name: 'Searchstore', component: SearchStoreView, meta: { requiresAuth: true, role: 'CUSTOMER' } },
  {path: '/payment/success', name: 'PaymentSuccess', component: () => import('@/views/servicee/PaySuccess.vue'), meta: { requiresAuth: true, role: 'CUSTOMER' } },
  {path: '/payment/fail', name: 'PaymentFailure', component: () => import('@/views/servicee/PayFail.vue'), meta: { requiresAuth: true, role: 'CUSTOMER' } },
  { path: '/nearby', name: 'Nearby', component: NearbyView, meta: { requiresAuth: true, role: 'CUSTOMER' } },
  // 리뷰 수정 페이지 (기존 데이터 불러오기)
  {
    path: '/mypage/review/edit/:reviewId',
    name: 'ReviewEdit',
    component: () => import('@/views/mypage/ReviewEditView.vue')
  },

  // ── 사장님 전용
  { path: '/ownerservice', name: 'OwnerService', component: OwnerOrderView, meta: { requiresAuth: true, role: 'OWNER' } },
  { path: '/ownerservice/addstore', name: 'AddStore', component: AddStoreView, meta: { requiresAuth: true, role: 'OWNER' } },

  // ── 라이더 랜딩 + 인증
  { path: '/riderlanding', name: 'RiderLanding', component: RiderLandingView },
  { path: '/rider/signup', name: 'RiderSignup', component: RiderSignupView, meta: { guestOnly: true } },
  { path: '/rider/signin', name: 'RiderSignin', component: RiderSigninView, meta: { guestOnly: true } },

  // ── 라이더 전용
  { path: '/riderservice', name: 'RiderService', component: RiderHomeView, meta: { requiresAuth: true, role: 'RIDER' } },

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
    if (role === 'ADMIN') return next('/admin')  // ← 추가

    return next('/home')
  }

  if (to.meta.requiresAuth) {
    if (!isSignedIn) {
      if (to.meta.role === 'OWNER') return next('/owner/signin')
      if (to.meta.role === 'RIDER') return next('/rider/signin')
      if (to.meta.role === 'ADMIN') return next('/admin/signin')  // ← 추가

      return next('/customer/signin')
    }

    if (to.meta.role && to.meta.role !== role) {
      if (role === 'OWNER') return next('/ownerservice')
      if (role === 'RIDER') return next('/riderservice')
      if (role === 'ADMIN') return next('/admin')  // ← 추가

      return next('/home')
    }
  }

  next()
})

export default router
