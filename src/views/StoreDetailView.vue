<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeTab = ref('menu'); // 기본 탭은 '메뉴'

// 테스트용 가상 데이터 (나중에 API 연결)
const storeInfo = ref({
  name: '코이보타루',
  rating: 5.0,
  reviewCount: 1253,
  minOrder: 15000,
  deliveryTime: '30~60분',
  deliveryTip: 1500,
  headerPic: '/images/store-header.jpg'
});

const menuList = ref([
  { id: 1, name: '참돔 오차즈케', price: 21000, desc: '밥 + 국산 참돔 + 녹차 + 후리카게 + 김 + 장국 구성입니다 (1인분)', pic: '' },
  { id: 2, name: '참돔 오차즈케', price: 21000, desc: '밥 + 국산 참돔 + 녹차 + 후리카게 + 김 + 장국 구성입니다 (1인분)', pic: '' },
  { id: 3, name: '참돔 오차즈케', price: 21000, desc: '밥 + 국산 참돔 + 녹차 + 후리카게 + 김 + 장국 구성입니다 (1인분)', pic: '' },
]);

onMounted(() => {
  // const storeId = route.params.id;
  // 여기서 백엔드 API 호출해서 데이터 가져오기
});
</script>

<template>
  <div class="store-detail-container">
    <section class="store-header">
      <div class="header-content">
        <img :src="storeInfo.headerPic" class="store-main-img" alt="가게 대표 이미지" />
        <div class="info-box">
          <div class="title-row">
            <h1>{{ storeInfo.name }}</h1>
            <button class="wish-btn">🤍</button>
          </div>
          <div class="rating-row">
            <span class="star">⭐ {{ storeInfo.rating }}</span>
            <span class="count">({{ storeInfo.reviewCount }})</span>
          </div>
          <table class="delivery-table">
            <tr><th>최소 주문 금액</th><td>{{ storeInfo.minOrder.toLocaleString() }}원</td></tr>
            <tr><th>예상 배달 시간</th><td>{{ storeInfo.deliveryTime }}</td></tr>
            <tr><th>배달 팁</th><td>{{ storeInfo.deliveryTip.toLocaleString() }}원</td></tr>
          </table>
        </div>
      </div>
    </section>

    <nav class="tabs">
      <button :class="{ active: activeTab === 'menu' }" @click="activeTab = 'menu'">메뉴</button>
      <button :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">가게정보</button>
      <button :class="{ active: activeTab === 'review' }" @click="activeTab = 'review'">리뷰</button>
    </nav>

    <section v-if="activeTab === 'menu'" class="menu-list">
      <div v-for="menu in menuList" :key="menu.id" class="menu-item-card">
        <div class="menu-info">
          <h3 class="menu-name">{{ menu.name }}</h3>
          <p class="menu-desc">{{ menu.desc }}</p>
          <span class="menu-price">{{ menu.price.toLocaleString() }}원</span>
        </div>
        <div class="menu-img-wrapper">
          <img :src="menu.pic || '/images/default-menu.png'" class="menu-img" alt="메뉴 이미지" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.store-detail-container { max-width: 800px; margin: 0 auto; background: #fff; }

/* 상단 헤더 스타일 */
.store-header { padding: 20px; border-bottom: 8px solid #f5f5f5; }
.header-content { display: flex; gap: 20px; position: relative; }
.store-main-img { width: 300px; height: 200px; border-radius: 12px; object-fit: cover; }
.info-box { flex: 1; }
.title-row { display: flex; justify-content: space-between; align-items: center; }
.wish-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
.rating-row { margin: 10px 0; font-size: 1.1rem; }
.delivery-table { width: 100%; font-size: 0.9rem; color: #666; border-spacing: 0 8px; }
.delivery-table th { text-align: left; font-weight: normal; width: 100px; }

/* 탭 스타일 */
.tabs { display: flex; border-bottom: 1px solid #eee; position: sticky; top: 0; background: #fff; z-index: 10; }
.tabs button { flex: 1; padding: 15px; border: none; background: none; font-size: 1rem; color: #888; cursor: pointer; }
.tabs button.active { color: #333; font-weight: bold; border-bottom: 3px solid #333; }

/* 메뉴 카드 스타일 */
.menu-list { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.menu-item-card { 
  display: flex; justify-content: space-between; padding: 20px;
  border: 1px solid #eee; border-radius: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.menu-info { flex: 1; padding-right: 15px; }
.menu-name { margin: 0 0 8px 0; font-size: 1.2rem; }
.menu-desc { font-size: 0.85rem; color: #999; line-height: 1.4; margin-bottom: 15px; }
.menu-price { font-size: 1.1rem; font-weight: bold; }
.menu-img { width: 110px; height: 110px; border-radius: 10px; object-fit: cover; }
</style>