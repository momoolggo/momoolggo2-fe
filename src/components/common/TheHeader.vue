<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

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

const goLocation = () => router.push('/location')
const goFavorite = () => router.push('/favorite')
const goCart     = () => router.push('/cart')
const goSignin   = () => router.push('/signin')
const goMypage   = () => router.push('/mypage')
const goSearchstore = () => router.push('/searchstore')
const goEvent = () => router.push('/event')
const goCustomerservice = () => router.push('/mypage/cs')
const goTodayFood = () => router.push('/whatKind')

const logoLink = computed(() => {
  const role = userStore.state.role
  if (role === 'OWNER') return '/ownerservice'
  if (role === 'CUSTOMER') return '/home'
  return '/'
})

const isOwner = computed(() => userStore.state.role === 'OWNER')
</script>

<template>
  <header class="header">

    <!-- 사장님 헤더 -->
    <div v-if="isOwner" class="owner_header_inner">
      <router-link to="/ownerservice" class="logo_link">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="logo_img header_logo" />
      </router-link>
      <span class="owner_title">사장님 서비스</span>
      <div class="owner_nav">
        <span class="nav_username">{{ userInfo?.name ?? '' }}님</span>
        <button class="nav_text_btn" @click="emit('signout')">로그아웃</button>
      </div>
    </div>

    <!-- 고객 헤더 -->
    <template v-else>
      <div class="header_inner">
        <router-link :to="logoLink" class="logo_link">
          <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="logo_img header_logo" />
        </router-link>

        <div class="header_address">
          <span class="address_text">가게·메뉴 검색</span>
          <button class="address_icon">
            <i class="bi bi-search"></i>
          </button>
        </div>

        <nav class="header_nav">
          <button class="nav_icon_btn" @click="goLocation">
            <i class="bi bi-geo-alt-fill nav_icon"></i>
            <span class="nav_label">배달 주소</span>
          </button>
          <button class="nav_icon_btn" @click="goFavorite">
            <i class="bi bi-heart nav_icon"></i>
            <span class="nav_label">찜하기</span>
          </button>
          <button class="nav_icon_btn" @click="goCart">
            <i class="bi bi-cart4 nav_icon"></i>
            <span class="nav_label">장바구니</span>
          </button>

          <div class="nav_divider"></div>

          <template v-if="!isSignedIn">
            <button class="nav_text_btn" @click="goSignin">로그인</button>
            <router-link to="/signup" class="nav_text_btn">회원가입</router-link>
          </template>

          <template v-else>
            <span class="nav_username">{{ userInfo?.name ?? '' }}님</span>
            <button class="nav_text_btn" @click="emit('signout')">로그아웃</button>
            <button class="nav_text_btn" @click="goMypage">마이페이지</button>
          </template>
        </nav>
      </div>

      <div class="nav_bottom">
        <div class="nav_bottom_inner">
          <button class="nav_bottom_btn" @click="goSearchstore">주변 맛집찾기</button>
          <button class="nav_bottom_btn" @click="goTodayFood">오늘 뭐먹지?</button>
          <button class="nav_bottom_btn" @click="goEvent">이벤트</button>
          <button class="nav_bottom_btn" @click="goCustomerservice">고객 센터</button>
        </div>
      </div>
    </template>

  </header>
</template>

<style scoped>
.header {
  position: relative;
  z-index: 100;
  width: 100%;
  background-color: #FEFAEE;
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-header);
  align-items: center;
  overflow: hidden;
}

/* 고객 헤더 inner */
.header_inner {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  align-items: center;
  gap: 16px;
  height: 60px;
  padding: 0 24px;
  box-sizing: border-box;
}

/* 사장님 헤더 inner */
.owner_header_inner {
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
  color: var(--primary);
  flex: 1;
}

.owner_nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.logo_link {
  justify-self: start;
  display: flex;
  align-items: center;
}

.header_logo {
  display: block;
  width: 160px;
  height: auto;
  max-height: 120px;
}

.header_address {
  flex: 1;
  display: flex;
  align-items: center;
  justify-self: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  margin: 0 auto;
  padding: 8px 14px;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  width: 100%;
  max-width: 530px;
  min-width: 0;
  transition: border-color 0.15s;
}

.header_address:hover { border-color: var(--primary); }
.address_icon { font-size: 14px; background: none; border: none; }
.address_text { font-size: 13px; color: var(--gray); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }

.header_nav {
  display: flex;
  align-items: center;
  justify-self: end;
  width: 500px;
  gap: 4px;
}

.nav_icon_btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  transition: background 0.12s;
}
.nav_icon_btn:hover { background: var(--primary-light); }
.nav_icon  { font-size: 24px; }
.nav_label { font-size: 11px; color: #555; font-weight: 500; }

.nav_divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  margin: 0 6px;
}

.nav_bottom {
  width: 100%;
  background-color: #FEFAEE;
  border-bottom: 1px solid var(--border);
}

.nav_bottom_inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.nav_bottom_btn {
  padding: 6px 10px;
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  border-radius: var(--radius-sm);
  text-decoration: none;
  display: flex;
  align-items: center;
}

.nav_bottom_btn:hover { color: var(--primary); }

.nav_username {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
  padding: 0 6px;
}

.nav_text_btn {
  padding: 6px 10px;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  border-radius: var(--radius-sm);
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: color 0.12s, background 0.12s;
  cursor: pointer;
}
.nav_text_btn:hover { color: var(--primary); background: var(--primary-light); }
</style>