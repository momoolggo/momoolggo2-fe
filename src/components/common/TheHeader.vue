<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed, ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import addressService from '@/services/addressService'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const searchText = ref('')

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

onMounted(loadDefaultAddress)

watch(() => route.path, () => {
  loadDefaultAddress()
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
        <span class="nav_username">{{ userInfo?.name ?? '' }}님</span>
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
            <span class="nav_username">{{ userInfo?.name ?? '' }}님</span>
            <button class="nav_text_btn" @click="emit('signout')">로그아웃</button>
          </template>

          <button class="nav_icon_btn" @click="goCart">
            <i class="bi bi-cart4"></i>
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

.logo_img {
  width: 80px;
  height: auto;
}

/* 고객 헤더 (480px 고정)*/
.header {
  position: relative;
  top: 0;
  z-index: 100;
  width: 100%;
  max-width: 480px;
  height: 180px;
  background: #FEFAEE;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.header_inner {
  width: 100%;
  max-width: 480px;
  padding: 8px 16px 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  width: 120px;
  height: auto;
  object-fit: contain;
  margin-right: 25px;
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
  margin-top: 11px;
  margin-right: 10px;
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
  margin-top: 15px;
}
.nav_text_btn:active { color: #d63031; }

.nav_username {
  font-size: 13px;
  font-weight: 700;
  color: #d63031;
  padding: 0 4px;
  margin-top: 15px;
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
</style>
