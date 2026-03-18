<script setup>
import { reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import MenuCategory from '@/components/store/MenuCategory.vue';
import StoreInfo from '@/components/store/StoreInfo.vue';
import MenuDetailModal from '@/components/store/MenuModal.vue';
import storeService from '@/services/storeService';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const userStore = useUserStore();
const userNo = userStore.state.userNo;

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('blob')) return path
  return `http://localhost:8080${path}`
}

const state = reactive({
  storeInfo: {},
  menuList: [],
  activeTab: 'menu',
  selectedMenu: {},
  review: [],
  isModalOpen: false,
  isWished: false,
});

const getStoreDetail = async () => {
  const storeId = Number(route.params.id);
  const params = { userNo: userNo, storeId: storeId };
  try {
    const res = await storeService.getStore(storeId);
    state.storeInfo = res.resultData;
    const result = await storeService.checkFavorite(params);
    state.isWished = result.resultData || false;
  } catch (error) {
    console.error("가게데이터 로드 실패:", error);
  }
};

const getMenuList = async () => {
  const storeId = route.params.id;
  try {
    const res = await storeService.getMenuList(storeId);
    state.menuList = res.resultData || [];
  } catch (error) {
    console.error("메뉴 데이터 로드 실패:", error);
  }
};

const toggleWish = async () => {
  const params = { userNo: userNo, storeId: Number(route.params.id) };
  try {
    const result = await storeService.toggleFavorite(params);
    state.isWished = result.resultData;
  } catch (error) {
    console.error("찜 처리 중 오류 발생:", error);
    alert("요청 처리에 실패했습니다.");
  }
};

const groupedMenu = computed(() => {
  const result = [];
  state.menuList.forEach(menu => {
    const categoryName = menu.categoryName || '기타 메뉴';
    let group = result.find(g => g.name === categoryName);
    if (!group) {
      group = { name: categoryName, items: [] };
      result.push(group);
    }
    group.items.push(menu);
  });
  return result;
});

onMounted(() => {
  getStoreDetail();
  getMenuList();
});

const openMenuModal = (menu) => {
  state.selectedMenu = menu;
  state.isModalOpen = true;
};

const handleAddToCart = () => {
  state.isModalOpen = false;
};
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
        <button
          class="wish-btn"
          :class="{ 'is-active': state.isWished }"
          @click="toggleWish"
        >
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
      <button :class="{ active: state.activeTab === 'menu' }" @click="state.activeTab = 'menu'">메뉴</button>
      <button :class="{ active: state.activeTab === 'info' }" @click="state.activeTab = 'info'">가게정보</button>
      <button :class="{ active: state.activeTab === 'review' }" @click="state.activeTab = 'review'">리뷰</button>
    </nav>

    <div class="tab-content-area">
      <div v-if="state.activeTab === 'menu'" class="menu-list-wrapper">
        <MenuCategory
          v-for="group in groupedMenu"
          :key="group.name"
          :category-name="group.name"
          :items="group.items"
          @click-menu="openMenuModal"
        />
      </div>

      <div v-if="state.activeTab === 'info'" class="info-tab-wrapper">
        <StoreInfo :state="state.storeInfo" />
      </div>

      <div v-if="state.activeTab === 'review'" class="review-container">
        <div class="review-summary">
          <p v-if="state.review.length === 0">아직 작성된 리뷰가 없습니다.</p>
          <p v-else>총 <strong>{{ state.review.length }}</strong>개의 리뷰가 있습니다.</p>
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
}
.store-cover { position: relative; width: 100%; height: 250px; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.back-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(0,0,0,0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  cursor: pointer;
}
.store-header-info { padding: 24px 20px; text-align: left; }
.title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.title-row h1 { font-size: 1.6rem; font-weight: 800; margin: 0; color: #111; }
.wish-btn { background: none; border: none; cursor: pointer; padding: 5px; }
.heart-icon { font-size: 1.8rem; color: #ccc; }
.wish-btn.is-active .heart-icon { color: #ff5252; }
.rating-row { font-size: 1.1rem; margin-bottom: 20px; display: flex; align-items: center; gap: 4px; }
.star { color: #FFD700; font-weight: bold; }
.review-count { color: #222; font-weight: 500; }
.delivery-spec-grid { display: flex; flex-direction: column; gap: 10px; padding-top: 15px; border-top: 1px solid #f5f5f5; }
.spec-item { display: flex; align-items: center; font-size: 0.95rem; }
.spec-item .label { width: 100px; color: #666; }
.spec-item .val { color: #222; font-weight: 500; }
.detail-tabs { display: flex; border-bottom: 1px solid #eee; background: #fff; position: sticky; top: 0; z-index: 10; }
.detail-tabs button { flex: 1; padding: 14px 0; border: none; background: none; color: #999; font-size: 1rem; font-weight: 500; cursor: pointer; }
.detail-tabs button.active { color: #111; font-weight: 700; border-bottom: 3px solid #111; }
.tab-content-area { background: #f8f9fa; }
.review-summary { background: #fff; padding: 20px; text-align: center; color: #666; border-radius: 12px; }
</style>