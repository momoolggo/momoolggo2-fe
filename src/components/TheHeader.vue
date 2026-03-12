<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

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

const goFavorite = () => router.push('/favorite')
const goCart     = () => router.push('/cart')
const goSignin   = () => router.push('/signin')
const goMypage   = () => router.push('/mypage')
const goSearchstore = () => router.push('/searchstore');
const goRiderservice = () => router.push('/rider');
const goOwnerservice = () => router.push('/ownerservice');
const goEvent = () => router.push('/event');
const goCustomerservice = () => router.push('/mypage/cs');

</script>

<template>
  <header class="header">
    <div class="header_inner">

      <!-- 왼쪽 — 로고 -->
      <router-link to="/" class="logo_link">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="logo_img header_logo" />
      </router-link>

      <!-- 가운데 — 주소 -->
      <div class="header_address">
        <i class="bi bi-geo-alt-fill address_icon"></i>
        <span class="address_text">배달 받을 주소를 입력하세요</span>
      </div>

      <!-- 오른쪽 — 네비 -->
      <nav class="header_nav">
        <button class="nav_icon_btn" @click="goFavorite">
          <i class="bi bi-heart nav_icon"></i>
          <span class="nav_label">찜하기</span>
        </button>
        <button class="nav_icon_btn" @click="goCart">
          <i class="bi bi-cart4 nav_icon"></i>
          <span class="nav_label">장바구니</span>
        </button>

        <div class="nav_divider"></div>

        <!-- 비로그인 -->
        <template v-if="!isSignedIn">
          <button class="nav_text_btn" @click="goSignin">로그인</button>
          <router-link to="/signup" class="nav_text_btn">회원가입</router-link>
        </template>

        <!-- 로그인 상태 -->
        <template v-else>
          <span class="nav_username">{{ userInfo?.name ?? '' }}님</span>
          <button class="nav_text_btn" @click="emit('signout')">로그아웃</button>
          <button class="nav_text_btn" @click="goMypage">마이페이지</button>
        </template>
      </nav>

    </div>

    <!--상단바 하단-->
    <div class="nav_bottom">
      <div class="nav_bottom_inner">
        <button class="nav_bottom_btn" @click="goSearchstore">주변 맛집찾기</button>
      <button class="nav_bottom_btn" @click="goRiderservice">라이더 서비스</button>
      <button class="nav_bottom_btn" @click="goOwnerservice">사장님 서비스</button>
      <button class="nav_bottom_btn" @click="goEvent">이벤트</button>
      <button class="nav_bottom_btn" @click="goCustomerservice">고객 센터</button>
    </div>
      </div>

  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: var(--white);
  background-color: #FEFAEE;
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-header);
  align-items: center;
}

.header_inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.logo_link { flex-shrink: 0;}
.header_logo { 
  display: flex;
  align-items: flex-start;
  height: 120px;
  }

  .header_address {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  margin: 0 auto;
  padding: 8px 14px;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  max-width: 530px;
  transition: border-color 0.15s;
}

.header_address:hover { border-color: var(--primary); }
.address_icon { font-size: 14px; }
.address_text { font-size: 13px; color: var(--gray); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; justify-content: center;}

.header_nav {
  display: flex;
  align-items: center;
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
.nav_icon  { font-size: 18px; }
.nav_label { font-size: 11px; color: #555; font-weight: 500; }

.nav_divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  margin: 0 6px;
}

.nav_bottom{
  top: 0;
  z-index: 100;
  width: 100%;
  background: var(--white);
  background-color: #FEFAEE;
  border-bottom: 1px solid var(--border);
}
.nav_bottom_inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.nav_bottom_btn{
  padding: 6px 10px;
  background: none;
  border: none;
  font-size: 10px;
  font-weight: 600;
  color: #555;
  border-radius: var(--radius-sm);
  text-decoration: none;
  display: flex;
  align-items: center;
}

.nav_bottom_btn:hover { color: var(--primary);}

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
}
.nav_text_btn:hover { color: var(--primary); background: var(--primary-light); }
</style>