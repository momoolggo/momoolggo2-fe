<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useNotificationStore } from '@/stores/notificationStore'
import addressService from '@/services/addressService'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()
const searchText = ref('')
const isNotificationOpen = ref(false)

defineProps({
  isSignedIn: {
    type: Boolean,
    default: false,
  },
  userInfo: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['signout'])

// 기본 배송지 주소
const defaultAddress = ref('주소를 설정해 주세요')

const loadDefaultAddress = async () => {
  try {
    const res = await addressService.findAll()
    const list = res.resultData || res
    const def = list.find(a => a.defaultAd === 1) ?? list[0] ?? null
    if (def) {
      defaultAddress.value = def.addressDetail
        ? `${def.address} ${def.addressDetail}`
        : def.address
    } else {
      defaultAddress.value = '주소를 설정해 주세요'
    }
  } catch {
    defaultAddress.value = '주소를 설정해 주세요'
  }
}

const loadCartCount = async () => {
  if(userStore.state.isSignedIn && userStore.state.userNo) {
    await cartStore.refreshCartCount(userStore.state.userNo)
  }
}

const isCustomerSignedIn = computed(() =>
  userStore.state.isSignedIn && userStore.state.role === 'CUSTOMER'
)

const toggleNotificationDropdown = async () => {
  if (!isCustomerSignedIn.value) return

  isNotificationOpen.value = !isNotificationOpen.value

  if (isNotificationOpen.value) {
    await notificationStore.fetchNotifications()
  }
}

const closeNotificationDropdown = () => {
  isNotificationOpen.value = false
}

const formatNotificationTime = createdAt => {
  if (!createdAt) return ''

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getNotificationFallbackUrl = type => {
  if (type === 'NOTICE') return '/notice'
  if (type === 'POLICY') return '/privacy'
  if (type === 'ORDER_STATUS') return '/mypage/orders'
  if (type === 'REVIEW_BLIND_NOTICE') return '/mypage/review'

  return '/home'
}

const resolveNotificationTargetUrl = notification => {
  const targetUrl = notification.targetUrl

  if (targetUrl?.startsWith('/order/history/')) {
    const orderId = targetUrl.replace('/order/history/', '')
    return `/mypage/orders/${orderId}`
  }

  if (targetUrl?.startsWith('/mypage/reviews/') && targetUrl.endsWith('/edit')) {
    const reviewId = targetUrl
      .replace('/mypage/reviews/', '')
      .replace('/edit', '')

    return `/mypage/review/edit/${reviewId}`
  }

  if (targetUrl) return targetUrl

  return getNotificationFallbackUrl(notification.type)
}

const handleNotificationClick = async notification => {
  try {
    if (!notification.read) {
      await notificationStore.readNotification(notification.notificationId)
    }
  } catch (e) {
    console.error('알림 읽음 처리 실패:', e)
  }

  closeNotificationDropdown()

  const targetUrl = resolveNotificationTargetUrl(notification)

  router.push(targetUrl)
}

const handleReadAllNotifications = async () => {
  if (notificationStore.unreadCount === 0) return

  await notificationStore.readAllNotifications()
}


onMounted(() => {
  loadDefaultAddress()
  loadCartCount()

  if (isCustomerSignedIn.value) {
    notificationStore.fetchNotifications()
    notificationStore.connectSse()
  }
})

watch(() => route.path, () => {
  loadDefaultAddress()
  loadCartCount()
})

watch(isCustomerSignedIn, signedIn => {
  if (signedIn) {
    notificationStore.fetchNotifications()
    notificationStore.connectSse()
  } else {
    notificationStore.resetNotifications()
    closeNotificationDropdown()
  }
})

onBeforeUnmount(() => {
  notificationStore.disconnectSse()
})

const goCart        = () => router.push('/cart')
const goSignin      = () => router.push('/customer/signin')
const goAddress     = () => router.push('/mypage/address')
const goSearchstore = () => {
  const text = searchText.value.trim()
  if (!text) return
  router.push({ path: '/searchstore', query: { search_text: text } })
}

const logoLink = computed(() => {
  const role = userStore.state.role
  if (role === 'OWNER')    return '/ownerservice'
  if (role === 'CUSTOMER') return '/home'
  return '/'
})

const isOwner = computed(() => userStore.state.role === 'OWNER')
</script>

<template>
  <!-- 사장 헤더-->
  <header v-if="isOwner" class="owner_header">
    <div class="owner_header_inner">
      <router-link to="/ownerservice" class="logo_link">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="logo_img" />
      </router-link>
      <span class="owner_title">사장님 서비스</span>
      <div class="owner_nav">
        <span class="nav_username">{{ userStore.state.name || userInfo?.name || '' }}님</span>
        <button class="nav_text_btn" @click="emit('signout')">로그아웃</button>
      </div>
    </div>
  </header>

  <!-- 고객 헤더-->
  <header v-else class="header">
    <div class="header_inner">

      <div class="row-top">
        <router-link :to="logoLink" class="logo_link">
          <img src="@/assets/로고수정.png" alt="뭐물꼬" class="header_logo" />
        </router-link>

        <div class="top-actions">
          <template v-if="!isSignedIn">
            <button class="nav_icon_btn" @click="goSignin">
              <i class="bi bi-person"></i>
            </button>
          </template>
          <template v-else>
            <button class="nav_text_btn" @click="emit('signout')">로그아웃</button>
          </template>

          <div v-if="isCustomerSignedIn" class="notification_wrap">
  <button class="nav_icon_btn notification_btn" @click="toggleNotificationDropdown">
    <i class="bi bi-bell"></i>
    <span
      v-if="notificationStore.unreadCount > 0"
      class="notification_badge"
    >
      {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
    </span>
  </button>

  <div v-if="isNotificationOpen" class="notification_dropdown">
    <div class="notification_header">
      <strong>알림</strong>
      <button
        class="read_all_btn"
        :disabled="notificationStore.unreadCount === 0"
        @click.stop="handleReadAllNotifications"
      >
        전체 읽음
      </button>
    </div>

    <div v-if="notificationStore.isLoading" class="notification_empty">
      알림을 불러오는 중입니다.
    </div>

    <div
      v-else-if="notificationStore.notifications.length === 0"
      class="notification_empty"
    >
      도착한 알림이 없습니다.
    </div>

    <template v-else>
  <button
    v-for="notification in notificationStore.notifications"
    :key="notification.notificationId"
    class="notification_item"
    :class="{ unread: !notification.read }"
    @click="handleNotificationClick(notification)"
  >
    <span class="notification_dot"></span>

    <span class="notification_content">
      <span class="notification_title">{{ notification.title }}</span>
      <span class="notification_text">{{ notification.content }}</span>
      <span class="notification_time">
        {{ formatNotificationTime(notification.createdAt) }}
      </span>
    </span>
  </button>
</template>
  </div>
</div>

          <button class="nav_icon_btn cart_btn" @click="goCart">
            <i class="bi bi-cart4"></i>
            <span
            v-if="cartStore.cartCount >0"
            class="cart_badge">
            {{  cartStore.cartCount > 99 ? '99+' :cartStore.cartCount }}
          </span>
          </button>
        </div>
      </div>

      <button class="row-address" @click="goAddress">
        <i class="bi bi-geo-alt-fill address-pin"></i>
        <span class="address-text">{{ defaultAddress }}</span>
        <i class="bi bi-chevron-right address-arrow"></i>
      </button>

      <form class="row-search" @submit.prevent="goSearchstore">
        <label class="search-bar">
          <input type="search" v-model="searchText" placeholder="가게·메뉴 검색" maxlength="30">
          <button type="submit" class="search_icon">
            <i class="bi bi-search"></i>
          </button>
        </label>
      </form>

    </div>
  </header>
</template>

<style scoped>

/* 사장님 헤더 */
.owner_header {
  width: 100%;
  background: #FEFAEE;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
  position: sticky;
  top: 0;
  z-index: 200;
}

.owner_header_inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 60px;
  padding: 0 24px;
  box-sizing: border-box;
}

.owner_title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary, #e84040);
  flex: 1;
}

.owner_nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.owner_nav .nav_username {
  max-width: none;
  overflow: visible;
  text-overflow: initial;
}

.logo_img {
  width: 80px;
  height: auto;
}

/* 고객 헤더 (480px 고정)*/
.header {
  position: relative;
  top: 0;
  z-index: 10000;
  width: 100%;
  max-width: 480px;
  height: 180px;
  background: #FEFAEE;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
  display: flex;
  justify-content: center;
  margin: 0 auto;
  overflow: visible;
}
.header_inner {
  width: 100%;
  max-width: 480px;
  padding: 8px 16px 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: visible;
}

.row-top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo_link {
  display: flex;
  align-items: center;
}

.header_logo {
  margin-top: 10px;
  width: 110px;
  height: auto;
  object-fit: contain;
  margin-right: 0;
}

.top-actions {
  position: absolute;
  right: 8px;
  top: 20px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav_icon_btn {
  position: relative;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 21px;
  color: #333;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  margin-right: 0;
}

.nav_icon_btn:active { color: #d63031; }

.nav_text_btn {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: #4a4646;
  padding: 4px 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-top: 0;
  white-space: nowrap;
}
.nav_text_btn:active { color: #d63031; }

.nav_username {
  max-width: 42px;
  font-size: 12px;
  font-weight: 700;
  color: #d63031;
  padding: 0 1px;
  margin-top: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-address {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 100%;
  text-align: center;
  background-color: #FEFAEE;
  border: none;
  padding: 0;
  cursor: pointer;
}
.row-address:active .address-text,
.row-address:active .address-pin,
.row-address:active .address-arrow { color: #d63031; }

.address-pin {
  font-size: 13px;
  color: #d63031;
  flex-shrink: 0;
}

.address-text {
  font-size: 12px;
  font-weight: 300;
  color: #555;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-bar {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1.5px solid #e0dcd0;
  border-radius: 22px;
  padding: 9px 14px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.search-bar:active { border-color: #d63031; }

.search_icon {
  font-size: 15px;
  color: #888;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

input[type="search"] {
  background: transparent;
  outline: none;
  border: none;
  width: 100%;
}

input[type="search"]::-webkit-search-decoration,
input[type="search"]::-webkit-search-cancel-button,
input[type="search"]::-webkit-search-results-button,
input[type="search"]::-webkit-search-results-decoration { display: none; }

/* 장바구니 배지 */
.cart_btn {
  position: relative;
}


.notification_wrap {
  position: relative;
  z-index: 10001;
}

.notification_btn {
  position: relative;
}

.cart_badge,
.notification_badge {
  position: absolute;
  top: -3px;
  right: -2px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  background: #d63031;
  color: #fff;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  line-height: 1;
}

.notification_dropdown {
  position: absolute;
  top: 44px;
  right: 0;
  width: 320px;
  max-height: 420px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #eee1d3;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  z-index: 10002;
}

.notification_header {
  position: sticky;
  top: 0;
  background: #fff;
  padding: 12px 14px;
  border-bottom: 1px solid #f0e7dc;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notification_header strong {
  font-size: 15px;
  color: #222;
}

.read_all_btn {
  border: none;
  background: transparent;
  color: #d63031;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.read_all_btn:disabled {
  color: #bbb;
  cursor: default;
}

.notification_empty {
  padding: 28px 14px;
  color: #888;
  font-size: 13px;
  text-align: center;
}

.notification_item {
  width: 100%;
  border: none;
  background: #fff;
  padding: 12px 14px;
  display: flex;
  gap: 8px;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid #f6f1ea;
}

.notification_item.unread {
  background: #fff8ee;
}

.notification_item:active {
  background: #f9efe4;
}

.notification_dot {
  width: 7px;
  height: 7px;
  margin-top: 6px;
  border-radius: 50%;
  background: transparent;
  flex-shrink: 0;
}

.notification_item.unread .notification_dot {
  background: #d63031;
}

.notification_content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification_title {
  font-size: 13px;
  font-weight: 800;
  color: #222;
}

.notification_text {
  font-size: 12px;
  color: #555;
  line-height: 1.4;
  word-break: keep-all;
}

.notification_time {
  font-size: 11px;
  color: #aaa;
}

</style>
