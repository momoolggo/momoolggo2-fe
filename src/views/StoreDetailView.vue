<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MenuItem from '@/components/MenuCard.vue';
import MenuDetailModal from '@/components/MenuModal.vue';
import storeService from '@/services/storeService';

const route = useRoute();
const router = useRouter();

const state = reactive({
    storeInfo: {
        name: '',
        avg: 0,
        sum: 0,
        min: 0,
        pic: '',
    },
    menuList: [],
    activeTab: 'menu',
    selectedMenu: {},
    isModalOpen: false,
    storedetail:{}
});

const getStoreDetail = async () => {
    const storeId = route.params.id;
    try {
        const res = await storeService.getStore(storeId);
        state.storeInfo = { ...state.storeInfo, ...res.resultData };
        const menuRes = await storeService.getMenuList(storeId);
        state.menuList = menuRes.data;
    } catch (error) {
        console.error("데이터 로드 실패:", error);
        // 이미지 예시 데이터
        state.storeInfo = { name: '코이보타루', avg: 5.0, sum: 1253, min: 15000, pic: '' };
        state.menuList = [
            { id: 1, name: '참돔 오차즈케', price: 21000, desc: '밥 + 국산 참돔 + 녹차 + 후리카게 + 김 + 장국 구성입니다 (1인분)', pic: '' }
            , { id: 1, name: '참돔 오차즈케', price: 21000, desc: '밥 + 국산 참돔 + 녹차 + 후리카게 + 김 + 장국 구성입니다 (1인분)', pic: '' }, { id: 1, name: '참돔 오차즈케', price: 21000, desc: '밥 + 국산 참돔 + 녹차 + 후리카게 + 김 + 장국 구성입니다 (1인분)', pic: '' },
            { id: 1, name: '참돔 오차즈케', price: 21000, desc: '밥 + 국산 참돔 + 녹차 + 후리카게 + 김 + 장국 구성입니다 (1인분)', pic: '' }, { id: 1, name: '참돔 오차즈케', price: 21000, desc: '밥 + 국산 참돔 + 녹차 + 후리카게 + 김 + 장국 구성입니다 (1인분)', pic: '' }
        ];
    }
};

onMounted(getStoreDetail);

const openMenuModal = (menu) => {
    state.selectedMenu = menu;
    state.isModalOpen = true;
};

const closeDetail = () => router.back();

const handleAddToCart = (item) => {
    console.log("장바구니 담기:", item);
    state.isModalOpen = false;
};
</script>

<template>
<div class="store-detail-view">
    <section class="store-header">
        <div class="info-container">
            <div class="info-visual">
                <img :src="state.storeInfo.pic || '/images/default-store.png'" class="store-img" />
            </div>

            <div class="info-content">
                <div class="title-row">
                    <h1>{{ state.storeInfo.name }}</h1>
                    <button class="wish-heart">🤍</button>
                </div>
                <div class="rating-row">
                    <span class="star">⭐ {{ state.storeInfo.avg }}</span>
                    <span class="review-count">({{ state.storeInfo.sum.toLocaleString() }})</span>
                </div>
                <div class="delivery-spec">
                    <div class="spec-item">
                        <span class="label">최소 주문 금액</span>
                        <span class="val">{{ state.storeInfo.min?.toLocaleString() }}원</span>
                    </div>
                    <div class="spec-item">
                        <span class="label">예상 배달 시간</span>
                        <span class="val">30~40분</span>
                    </div>
                    <div class="spec-item">
                        <span class="label">배달 팁</span>
                        <span class="val">1500원</span>
                    </div>
                </div>
            </div>

            <div class="info-character">
                <img src="/public/favicon.png" alt="character" /> 얘 이미지 어떻게 할지 생각좀해봐야함
            </div>
        </div>
    </section>

    <nav class="detail-tabs"> <!--탭 네비게이션-->
        <button :class="{ active: state.activeTab === 'menu' }" @click="state.activeTab = 'menu'">메뉴</button>
        <button :class="{ active: state.activeTab === 'info' }" @click="state.activeTab = 'info'">가게정보</button>
        <button :class="{ active: state.activeTab === 'review' }" @click="state.activeTab = 'review'">리뷰</button>
    </nav>

    <!-- 메뉴 탭 내용 -->
    <div v-if="state.activeTab === 'menu'" class="menu-container">
        <MenuItem
            v-for="menu in state.menuList"
            :key="menu.id"
            :menu="menu"
            @click-menu="openMenuModal"
        />
    </div>
    <!-- 가게정보 탭 내용 -->
    <div v-if="state.activeTab === 'info'" class="info-container">
        <p>가게 상세 정보와 설명이 여기에 표시됩니다. 컴포넌트 미완성</p>
    </div>
    <!-- 리뷰 탭 내용 -->
    <div v-if="state.activeTab === 'review'" class="review-container">
        <p>사용자 리뷰와 평점이 여기에 표시됩니다. 컴포넌트 만들어야ㅐ됨</p>
    </div>

    <!-- 메뉴 상세 모달 -->
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

/* 상단 내비게이션 */
.top-nav { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-bottom: 1px solid #eee; background: #fff; }
.nav-center { flex: 1; text-align: center; color: #888; font-size: 0.9rem; }
.nav-right button { background: none; border: none; font-size: 0.85rem; margin-left: 15px; cursor: pointer; color: #333; }

/* 가게 정보 섹션 (PC 가로형) */
.store-header { padding: 40px; border-bottom: 8px solid #f5f5f5; }
.info-container { display: flex; gap: 40px; align-items: flex-start; position: relative; }

.store-img { width: 350px; height: 230px; border-radius: 12px; object-fit: cover; }

.info-content { flex: 1; }
.title-row { display: flex; align-items: center; justify-content:space-between; gap: 15px; margin-bottom: 10px; }
.title-row h1 { font-size: 2.2rem; margin: 0; }
.wish-heart { background: none; border: none; font-size: 24px; cursor: pointer; }

.rating-row { font-size: 1.2rem; margin-bottom: 30px; }
.star { color: #FFD700; font-weight: bold; }

.delivery-spec { display: flex; flex-direction: column; gap: 12px; }
.spec-item { display: flex; font-size: 1rem; }
.spec-item .label { width: 120px; color: #999; }
.spec-item .val { color: #333; font-weight: 500; }

.info-character { width: 150px; align-self: flex-end; }
.info-character img { width: 100%; object-fit: contain; }

/* 탭 스타일 */
.detail-tabs { display: flex; border-bottom: 1px solid #eee; justify-content: center; }
.detail-tabs button { padding: 15px 60px; border: none; background: none; color: #999; font-size: 1.1rem; cursor: pointer; }
.detail-tabs button.active { color: #333; font-weight: bold; border-bottom: 4px solid #333; }

.menu-container { padding: 20px; display: flex; flex-direction: column; gap: 15px; }
</style>
