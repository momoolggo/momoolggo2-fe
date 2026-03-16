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
    const params = {
        userNo: userNo,
        storeId: storeId
    };
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

const getReviewList = async () => {
    const storeId = route.params.id;
    try {
        const res = await storeService.getReviewList(storeId);
        state.review = res.resultData || [];
    } catch (error) {
        console.error("리뷰 데이터 로드 실패:", error);
    }
};

const toggleWish = async () => {
    const params = {
        userNo: userNo,
        storeId: Number(route.params.id)
    };
    try {
        const result =await storeService.toggleFavorite(params);
        state.isWished =result.resultData;
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
    getReviewList();
});

const openMenuModal = (menu) => {
    state.selectedMenu = menu;
    state.isModalOpen = true;
};

const handleAddToCart = (item) => {
    state.isModalOpen = false;
};
</script>

<template>
<div class="store-detail-view">
    <section class="store-header">
        <div class="info-container">
            <div class="info-visual">
                <img :src="state.storeInfo.storePic || '/images/default-store.png'" class="store-img" />
            </div>
            <div class="info-content">
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
                <div class="delivery-spec">
                    <div class="spec-item">
                        <span class="label">최소 주문 금액</span>
                        <span class="val">{{ state.storeInfo.minPrice?.toLocaleString() }}원</span>
                    </div>
                    <div class="spec-item">
                        <span class="label">예상 배달 시간</span>
                        <span class="val">30~40분</span>
                    </div>
                    <div class="spec-item">
                        <span class="label">배달 팁</span>
                        <span class="val">1,500원</span>
                    </div>
                </div>
            </div>
            <div class="info-character">
                <img src="/favicon.png" alt="character" />
            </div>
        </div>
    </section>

    <nav class="detail-tabs">
        <button :class="{ active: state.activeTab === 'menu' }" @click="state.activeTab = 'menu'">메뉴</button>
        <button :class="{ active: state.activeTab === 'info' }" @click="state.activeTab = 'info'">가게정보</button>
        <button :class="{ active: state.activeTab === 'review' }" @click="state.activeTab = 'review'">리뷰</button>
    </nav>

    <div v-if="state.activeTab === 'menu'" class="menu-tab-content">
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
        <p v-if="state.review.length === 0">아직 작성된 리뷰가 없습니다.</p>
        <div v-else>
            <p>총 {{ state.review.length }}개의 리뷰가 있습니다.</p>
        </div>
    </div>

    <MenuDetailModal
        :menu="state.selectedMenu"
        :is-open="state.isModalOpen"
        @close="state.isModalOpen = false"
        @add-to-cart="handleAddToCart"
    />
</div>
</template>

<style scoped>
.store-detail-view { max-width: 1100px; margin: 0 auto; background: #fff; }
.store-header { padding: 40px; border-bottom: 8px solid #f5f5f5; }
.info-container { display: flex; gap: 40px; align-items: flex-start; }
.store-img { width: 350px; height: 230px; border-radius: 12px; object-fit: cover; }
.info-content { flex: 1; }
.title-row { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 10px; }
.title-row h1 { font-size: 2.2rem; margin: 0; }

.wish-btn {
    background: #fff; border: 1px solid #ddd; border-radius: 50%;
    width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.heart-icon { font-size: 26px; color: #bbb; line-height: 1; margin-top: 2px; }
.wish-btn.is-active { border-color: #ff5252; background-color: #fff5f5; }
.wish-btn.is-active .heart-icon { color: #ff5252; }
.wish-btn:hover { transform: scale(1.05); }

.rating-row { font-size: 1.2rem; margin-bottom: 30px; }
.star { color: #FFD700; font-weight: bold; }
.delivery-spec { display: flex; flex-direction: column; gap: 12px; }
.spec-item { display: flex; font-size: 1rem; }
.spec-item .label { width: 120px; color: #999; }
.spec-item .val { color: #333; font-weight: 500; }
.info-character { width: 150px; align-self: flex-end; }
.info-character img { width: 100%; object-fit: contain; }

/* 탭 바: 상단 고정(sticky) 속성 완전 제거 */
.detail-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
    justify-content: center;
    background: #fff;
    position: relative; /* 고정 방지 */
    z-index: 10;
}
.detail-tabs button { padding: 15px 60px; border: none; background: none; color: #999; font-size: 1.1rem; cursor: pointer; }
.detail-tabs button.active { color: #333; font-weight: bold; border-bottom: 4px solid #333; }
.info-tab-wrapper, .menu-tab-content { width: 100%; }
</style>
