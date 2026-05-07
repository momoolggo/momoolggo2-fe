<script setup>
import { reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import MenuCategory from '@/components/store/MenuCategory.vue'
import StoreInfo from '@/components/store/StoreInfo.vue'
import MenuDetailModal from '@/components/store/MenuModal.vue'
import storeService from '@/services/storeService'
import { useUserStore } from '@/stores/userStore'
import { showAlert } from '@/composables/useAlert'
import StoreReview from '@/components/store/ReviewInfo.vue'

const route = useRoute()
const userStore = useUserStore()
const userNo = userStore.state.userNo

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('data:')) return path
  if (path.startsWith('http') || path.startsWith('blob')) return path
  return `${path}`
}

const state = reactive({
  storeInfo: {},
  menuList: [],
  activeTab: 'menu',
  selectedMenu: {},
  reviews: [],
  isModalOpen: false,
  isWished: false,
  menuSearchText: '',
  searchResults: [],
})

const getStoreDetail = async () => {
  const storeId = Number(route.params.id)
  const params = { userNo: userNo, storeId: storeId }
  try {
    const res = await storeService.getStore(storeId)
    state.storeInfo = res.resultData
    const result = await storeService.checkFavorite(params)
    state.isWished = result.resultData || false
  } catch (error) {
    console.error('가게데이터 로드 실패:', error)
  }
}

const getMenuList = async () => {
  const storeId = route.params.id
  try {
    const res = await storeService.getMenuList(storeId)
    state.menuList = res.resultData || []
  } catch (error) {
    console.error('메뉴 데이터 로드 실패:', error)
  }
}

//가게 내 메뉴 검색 추가
const searchMenu = async () => {
  if (!state.menuSearchText.trim()) {
    state.searchResults = []
    return
  }
  const storeId = route.params.id
  const res = await storeService.menuSearchInStore(storeId, state.menuSearchText)
  state.searchResults = res.resultData || []
}

// 가게 리뷰 조회 추가
const getReviewList = async () => {
  const storeId = route.params.id
  try {
    const res = await storeService.getStoreReviews(storeId)
    state.reviews = res.resultData || []
  } catch (error) {
    console.error('리뷰 데이터 로드 실패:', error)
  }
}

const toggleWish = async () => {
  const params = { userNo: userNo, storeId: Number(route.params.id) }
  try {
    const result = await storeService.toggleFavorite(params)
    state.isWished = result.resultData
  } catch (error) {
    console.error('찜 처리 중 오류 발생:', error)
    await showAlert('요청 처리에 실패했습니다.', { title: '오류', type: 'error' })
  }
}

const groupedMenu = computed(() => {
  const result = []
  state.menuList.forEach((menu) => {
    const categoryName = menu.categoryName || '기타 메뉴'
    let group = result.find((g) => g.name === categoryName)
    if (!group) {
      group = { name: categoryName, items: [] }
      result.push(group)
    }
    group.items.push(menu)
  })
  return result
})

onMounted(() => {
  getStoreDetail()
  getMenuList()
  getReviewList()
})

const openMenuModal = (menu) => {
  state.selectedMenu = menu
  state.isModalOpen = true
}

const handleAddToCart = (item) => {
  state.isModalOpen = false
}
</script>

<template>
  <div class="store-detail-view">
    <section class="store-cover">
      <img
        :src="getImageUrl(state.storeInfo.storePic) || '/images/default-store.png'"
        class="cover-img"
      />
      <button class="back-btn" @click="$router.back()">←</button>
    </section>

    <section class="store-header-info">
      <div class="title-row">
        <h1>{{ state.storeInfo.storeName }}</h1>
        <button class="wish-btn" :class="{ 'is-active': state.isWished }" @click="toggleWish">
          <span class="heart-icon">{{ state.isWished ? '♥' : '♡' }}</span>
        </button>
      </div>

      <div class="rating-row">
        <span class="star">⭐ {{ state.storeInfo.ratingAvg }}</span>
        <span class="review-count">({{ state.storeInfo.ratingCount }})</span>
      </div>

      <div class="delivery-spec-grid">
        <div class="spec-item">
          <span class="label">최소 주문 금액</span>
          <span class="val">{{ state.storeInfo.minPrice?.toLocaleString() }}원</span>
        </div>
        <div class="spec-item">
          <span class="label">예상 배달 시간</span>
          <span class="val">30~60분</span>
        </div>
        <div class="spec-item">
          <span class="label">배달 팁</span>
          <span class="val">1,500원</span>
        </div>
      </div>
    </section>

    <nav class="detail-tabs">
      <button :class="{ active: state.activeTab === 'menu' }" @click="state.activeTab = 'menu'">
        메뉴
      </button>
      <button :class="{ active: state.activeTab === 'info' }" @click="state.activeTab = 'info'">
        가게정보
      </button>
      <button :class="{ active: state.activeTab === 'review' }" @click="state.activeTab = 'review'">
        리뷰 {{ state.reviews.length > 0 ? `(${state.reviews.length})` : '' }}
      </button>
    </nav>

    <div class="tab-content-area">
      <div v-if="state.activeTab === 'menu'" class="menu-list-wrapper">
  <div class="menu-search-bar">
    <input
      v-model="state.menuSearchText"
      type="text"
      placeholder="메뉴를 검색하세요"
      @keyup.enter="searchMenu"
    />
    <button @click="searchMenu">검색</button>
  </div>

  <template v-if="state.searchResults.length > 0">
    <MenuCategory
      category-name="검색 결과"
      :items="state.searchResults"
      @click-menu="openMenuModal"
    />
  </template>
  <template v-else>
    <MenuCategory
      v-for="group in groupedMenu"
      :key="group.name"
      :category-name="group.name"
      :items="group.items"
      @click-menu="openMenuModal"
    />
  </template>
</div>

      <div v-if="state.activeTab === 'info'" class="info-tab-wrapper">
        <StoreInfo :state="state.storeInfo" />
      </div>

      <!-- 리뷰 탭 (수정됨) -->
      <div v-if="state.activeTab === 'review'" class="review-container">
        <!-- 기존 review 탭 내용 전부 삭제하고 아래로 교체 -->
        <div v-if="state.activeTab === 'review'">
          <StoreReview :reviews="state.reviews" />
        </div>
      </div>
    </div>

    <MenuDetailModal
      :menu="state.selectedMenu"
      :is-open="state.isModalOpen"
      :min-price="state.storeInfo.minPrice"
      @close="state.isModalOpen = false"
      @add-to-cart="handleAddToCart"
    />
  </div>
</template>

<style scoped>
.store-detail-view {
  width: 100%;
  background: #fff;
  min-height: 100vh;
  max-width: 480px;
  padding-bottom: 60px;
  margin: 0 auto;
}
.store-cover {
  position: relative;
  width: 100%;
  height: 250px;
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.back-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  cursor: pointer;
}
.store-header-info {
  padding: 24px 20px;
  text-align: left;
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.title-row h1 {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0;
  color: #111;
}
.wish-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}
.heart-icon {
  font-size: 1.8rem;
  color: #ccc;
}
.wish-btn.is-active .heart-icon {
  color: #ff5252;
}
.rating-row {
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.star {
  color: #ffd700;
  font-weight: bold;
}
.review-count {
  color: #222;
  font-weight: 500;
}
.delivery-spec-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #f5f5f5;
}
.spec-item {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}
.spec-item .label {
  width: 100px;
  color: #666;
}
.spec-item .val {
  color: #222;
  font-weight: 500;
}
.detail-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.detail-tabs button {
  flex: 1;
  padding: 14px 0;
  border: none;
  background: none;
  color: #999;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}
.detail-tabs button.active {
  color: #111;
  font-weight: 700;
  border-bottom: 3px solid #111;
}
.tab-content-area {
  background: #f8f9fa;
}

/* 리뷰 스타일 */
.review-container {
  padding: 10px;
  background-color: #f8f3f3;
}
.review-empty {
  background: #fff;
  padding: 40px 20px;
  text-align: center;
  color: #999;
  border-radius: 12px;
}
.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.review-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.review-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.reviewer-name {
  font-size: 15px;
  font-weight: 700;
  color: #111;
}
.review-date {
  font-size: 12px;
  color: #bbb;
}
.review-stars {
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
}
.star-img {
  width: 16px;
  height: 16px;
}
.review-menu {
  font-size: 12px;
  color: #ff99aa;
  margin-bottom: 8px;
}
.review-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 8px;
}
.review-photo {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 10px;
}
</style>
