<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

const isMainPage = computed(() => route.name === 'MyPage')

const menus = [
  { icon: 'bi bi-person',            label: '내 정보 수정', path: '/mypage/profile' },
  { icon: 'bi bi-geo-alt',           label: '배송지 관리',  path: '/mypage/address' },
  { icon: 'bi bi-ticket-perforated', label: '쿠폰함',       path: '/mypage/coupon', badge: '쿠폰 2차' },
  { icon: 'bi bi-receipt',           label: '주문 내역',    path: '/mypage/orders'  },
  { icon: 'bi bi-star',              label: '내 리뷰 관리', path: '/mypage/review'  },
  { icon: 'bi bi-headset',           label: '고객센터',     path: '/mypage/cs'      },
]
</script>

<template>
  <div class="mypage_wrap">
    <!-- 메인 마이페이지: 메뉴 그리드 -->
    <template v-if="isMainPage">
      <h2 class="page_title">마이페이지</h2>
      <div class="menu_grid">
        <div
          v-for="menu in menus"
          :key="menu.path"
          class="menu_card"
          @click="router.push(menu.path)"
        >
          <span v-if="menu.badge" class="badge">{{ menu.badge }}</span>
          <i :class="[menu.icon, 'menu_icon']"></i>
          <div class="menu_label">{{ menu.label }}</div>
        </div>
      </div>
    </template>

    <!-- 하위 페이지 -->
    <router-view v-else />
  </div>
</template>

<style scoped>
.mypage_wrap {
  max-width: 480px;
  margin: 40px auto;
  padding: 0 16px; 
  padding-bottom: 100px;
  height: auto;
  
}
.page_title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 28px;
  text-align: center;
}
.menu_grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.menu_card {
  position: relative;
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 36px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
 
}
.menu_card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 16px rgba(200,25,26,0.10);
}
.menu_icon {
  font-size: 36px;
  color: var(--primary);
}
.menu_label {
  font-size: 15px;
  font-weight: 600;
  color: var(--black);
}
.badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
}
</style>