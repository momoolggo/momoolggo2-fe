<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed, onMounted, reactive } from 'vue'
import userService from '@/services/userService'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const userName = computed(() => userStore.state.name || '고객')

const isMainPage = computed(() => route.name === 'MyPage')

const state = reactive({
  summary: null,
  isLoading: false,
  errorMsg: '',
})

const menus = [
  { icon: 'bi bi-person',            label: '내 정보 수정', path: '/mypage/profile' },
  { icon: 'bi bi-geo-alt',           label: '주소 관리',  path: '/mypage/address' },
  { icon: 'bi bi-ticket-perforated', label: '쿠폰함',       path: '/mypage/coupon' },
  { icon: 'bi bi-receipt',           label: '주문 내역',    path: '/mypage/orders'  },
  { icon: 'bi bi-star',              label: '내 리뷰 관리', path: '/mypage/review'  },
  { icon: 'bi bi-egg',           label: '내 펫',     path: '/mypage/pet'      },
]

const menuItems = computed(() =>
  menus.map(menu => {
    if (menu.path === '/mypage/coupon') {
      const count = Number(state.summary?.usableCouponCount || 0)
      return {
        ...menu,
        badge: `쿠폰 ${count}장`,
      }
    }

    return menu
  })
)

const greenPoint = computed(() => Number(state.summary?.green || 0))
const greenGrade = computed(() => state.summary?.greenGrade || {})

const progressPercent = computed(() => {
  const percent = Number(greenGrade.value.progressPercent || 0)
  return Math.min(Math.max(percent, 0), 100)
})

const pointToNextGradeText = computed(() => {
  const point = Number(greenGrade.value.pointToNextGrade || 0)
  const nextGradeName = greenGrade.value.nextGradeName

  if (!nextGradeName || point <= 0) return '최고 등급을 향해 잘 달리고 있어요.'

  return `${nextGradeName}까지 ${point}점 남았어요.`
})

const loadSummary = async () => {
  state.isLoading = true
  state.errorMsg = ''

  try {
    state.summary = await userService.getMyPageSummary()
  } catch (e) {
    console.error('마이페이지 요약 조회 실패:', e)
    state.errorMsg = ''
  } finally {
    state.isLoading = false
  }
}

onMounted(loadSummary)
</script>

<template>
  <div class="mypage_wrap">
    <!-- 메인 마이페이지: 메뉴 그리드 -->
    <template v-if="isMainPage">
      <h2 class="page_title">마이페이지</h2>

      <section class="summary_card">
        <div class="summary_top">
          <div>
            <p class="summary_label">
              <strong>{{ userName }}</strong>님의 친환경 등급</p>
            <h3 class="summary_name">
              <strong>{{ greenGrade.gradeName || '씨앗' }}</strong>
            </h3>
          </div>
          <div class="green_score">
            {{ greenPoint }}점
          </div>
        </div>

        <div class="green_bar">
          <div class="green_bar_fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>

        <div class="summary_bottom">
          <span>{{ pointToNextGradeText }}</span>
          <span>쿠폰 {{ Number(state.summary?.usableCouponCount || 0) }}장</span>
        </div>

      </section>

      <div class="menu_grid">
        <div
          v-for="menu in menuItems"
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
  margin-bottom: 20px;
  text-align: center;
}
.summary_card {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px 18px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.08);
}
.summary_top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}
.summary_label {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  color: #2e7d32;
}

.summary_label strong {
  font-size: 23px;
  font-weight: 900;
  color: #000000;
}

.summary_name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--black);
  line-height: 1.35;
}

.summary_name .user-name {
  display: block;
  margin-bottom: 2px;
  font-size: 22px;
  font-weight: 900;
  color: #1b5e20;
}

.summary_name strong {
  color: #2e7d32;
}
.green_score {
  flex-shrink: 0;
  min-width: 58px;
  padding: 8px 10px;
  border-radius: 999px;
  background: #e8f5e9;
  color: #1b5e20;
  font-size: 14px;
  font-weight: 800;
  text-align: center;
}
.green_bar {
  height: 10px;
  border-radius: 999px;
  background: #edf2ef;
  overflow: hidden;
}
.green_bar_fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7ac943, #2e7d32);
  transition: width 0.25s ease;
}
.summary_bottom {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
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
