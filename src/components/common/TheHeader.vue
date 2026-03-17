<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed, ref, onMounted, watch } from 'vue'
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

// 기본 배송지 주소
const defaultAddress = ref('주소를 설정해 주세요')

const loadDefaultAddress = async () => {
  try {
    const list = await addressService.findAll()
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

onMounted(loadDefaultAddress)

const goCart    = () => router.push('/cart')
const goSignin  = () => router.push('/signin')
const goAddress  = () => router.push('/mypage/address')

const logoLink = computed(() => {
  const role = userStore.state.role
  if (role === 'OWNER')    return '/ownerservice'
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

        <!--로고 + 장바구니/로그인 -->
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
              <span class="nav_username">{{ userInfo?.name ?? '' }}님</span>
              <button class="nav_text_btn" @click="emit('signout')">로그아웃</button>
            </template>

            <button class="nav_icon_btn" @click="goCart">
              <i class="bi bi-cart4"></i>
            </button>
          </div>
        </div>

        <!--현재 주소 -->
        <button class="row-address" @click="goAddress">
          <i class="bi bi-geo-alt-fill address-pin"></i>
          <span class="address-text">{{ defaultAddress }}</span>
          <i class="bi bi-chevron-right address-arrow"></i>
        </button>


        <!--검색창 -->
        <div class="row-search">
          <div class="search-bar">
            <span class="search-placeholder">가게 · 메뉴 검색</span>
            <i class="bi bi-search search-icon"></i>
          </div>
        </div>

      </div>
    </template>

  </header>
</template>

<style scoped>
.header {
  position: relative;
  top: 0;
  z-index: 100;
  width: 100%;
  max-width: 480px;
  height: 180px;
  background: #FEFAEE;
  border-bottom: 0 solid #e8e4d8;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  display: flex;
  justify-content: center;
}

/* 고객 헤더 전체 래퍼 */
.header_inner {
  width: 100%;
  max-width: 480px;
  padding: 8px 16px 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/*로고 + 우측 버튼 */
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
  width: 120px;
  height: auto;
  object-fit: contain;
}

.top-actions {
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav_icon_btn {
  background: none;
  border: none;
  font-size: 22px;
  color: #333;
  padding: 4px 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.nav_icon_btn:active { color: #d63031; }

.nav_text_btn {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 700;
  color: #4a4646;
  padding: 4px 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
}
.nav_text_btn:active { color: #d63031; }


.nav_username {
  font-size: 13px;
  font-weight: 700;
  color: #d63031;
  padding: 0 4px;
}


/*주소 */
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
.row-address:active .address-arrow{
  color: #d63031;
}


.address-pin {
  font-size: 13px;
  color: #d63031;
  flex-shrink: 0;
}

.address-text {
  font-size: 12px;
  color: #555;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*검색창 */
/* .row-search {} */

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

.search-placeholder {
  font-size: 13px;
  color: #aaa;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.search-icon {
  font-size: 15px;
  color: #888;
}

/*사장님 헤더*/
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
.logo_img {
  width: 80px;
  height: auto;
}
</style>