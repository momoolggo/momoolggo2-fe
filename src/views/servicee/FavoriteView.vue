<script setup>
import { reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import storeService from '@/services/storeService';
import { useUserStore } from '@/stores/userStore';
import { showAlert } from '@/composables/useAlert'

const router = useRouter();
const userStore = useUserStore();
const user = computed(() => userStore.state);

const state = reactive({
  wishList: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 6,
});

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('data:')) return path      // ← Base64 data URI 지원 추가
  if (path.startsWith('http') || path.startsWith('blob')) return path
  return `http://localhost:8080${path}`
}

const loadWishList = async () => {
  const params = {
    userNo: userStore.state.userNo,
    currentPage: state.currentPage,
    size: state.pageSize,
  };
  try {
    const res = await storeService.getFavorite(params);
    if (res && res.resultData) {
      // 초기 로드 시 모든 아이템에 찜 활성화 상태(isWished)를 주입
      const list = (res.resultData.list || []).map(item => ({
        ...item,
        isWished: true
      }));
      state.wishList = list;
      state.totalCount = res.resultData.totalCount || 0;
    }
  } catch (e) {
    console.error('찜 목록 로드 실패:', e);
    state.wishList = [];
  }
};

// 페이지 변경 감시하여 데이터 재로드
watch(() => state.currentPage, () => {
  loadWishList();
});

onMounted(loadWishList);

const totalPages = computed(() => Math.ceil(state.totalCount / state.pageSize));

const goPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  state.currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const toggleWish = async (store) => {
  try {
    const params = {
      userNo: user.value.userNo,
      storeId: Number(store.id)
    };
    const res = await storeService.toggleFavorite(params);
    store.isWished = res.resultData;
  } catch (e) {
    console.error('찜 해제 실패:', e);
    await showAlert('찜 해제 중 오류가 발생했습니다.', { title: '오류', type: 'error' })
  }
};

const goStore = (storeId) => {
  router.push(`/store/${storeId}`);
};
</script>

<template>
  <div class="wish-page">
    <h2 class="page-title">찜 목록</h2>
    <p class="total-count">총 {{ state.totalCount }}개</p>

    <div class="wish-list" v-if="state.wishList.length > 0">
      <div
        v-for="store in state.wishList"
        :key="store.id"
        class="wish-card"
        @click="goStore(store.id)"
      >
        <img :src="getImageUrl(store.pic) || '/images/default-store.png'" class="store-img" :alt="store.name" />

        <div class="card-body">
          <div class="card-header">
            <span class="store-name">{{ store.name }}</span>

            <button
              class="wish-btn"
              :class="{ active: store.isWished }"
              @click.stop="toggleWish(store)"
            >
              <svg viewBox="0 0 24 24" class="heart-icon">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>

          <div class="rating-info">
            <span class="star">★</span>
            <span class="rating-val">{{ store.avg }}</span>
            <span class="divider">|</span>
            <span class="review-count">리뷰 {{ store.sum?.toLocaleString() || 0 }}</span>
          </div>

          <div class="delivery-info">
            <span class="check-icon">✓</span>
            <span class="delivery-tip">배달팁 1,500원</span>
            <span class="divider">|</span>
            <span class="min-order">{{ (store.min || 0).toLocaleString() }}원 이상 배달</span>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-wish" v-else>
      <span class="empty-icon">🤍</span>
      <p>찜한 가게가 없습니다</p>
      <button class="go-main-btn" @click="router.push('/home')">가게 둘러보기</button>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-nav"
        :disabled="state.currentPage === 1"
        @click="goPage(state.currentPage - 1)"
      >&lt;</button>

      <button
        v-for="page in totalPages"
        :key="page"
        class="page-num"
        :class="{ active: state.currentPage === page }"
        @click="goPage(page)"
      >{{ page }}</button>

      <button
        class="page-nav"
        :disabled="state.currentPage === totalPages"
        @click="goPage(state.currentPage + 1)"
      >&gt;</button>
    </div>
  </div>
</template>

<style scoped>
/* 전체 레이아웃 */
.wish-page { max-width: 480px; margin: 0 auto; padding: 20px 16px 100px; background: #fff; min-height: 100vh; }
.page-title { text-align: left; font-size: 1.3rem; font-weight: 800; margin-bottom: 5px; color: #111; }
.total-count { font-size: 0.9rem; color: #888; margin-bottom: 20px; text-align: left; }

.wish-list { display: flex; flex-direction: column; gap: 14px; }

/* 카드 스타일: 사진처럼 테두리와 둥근 모서리 강조 */
.wish-card {
  display: flex;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 14px;
  position: relative;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  cursor: pointer;
  transition: transform 0.2s;
}
.wish-card:active { transform: scale(0.98); }

/* 이미지 스타일 */
.store-img {
  width: 95px;
  height: 95px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f9f9f9;
}

.card-body {
  flex: 1;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 헤더: 이름과 하트 양끝 배치 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.store-name { font-size: 1.1rem; font-weight: 700; color: #222; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }

/* 큰 빨간 하트 디자인 */
.wish-btn { background: none; border: none; padding: 0; cursor: pointer; transition: transform 0.1s ease; z-index: 10; }
.heart-icon { width: 28px; height: 28px; fill: #eee; stroke: #ddd; stroke-width: 0.5px; transition: fill 0.2s; }
.wish-btn.active .heart-icon { fill: #ff4d6d; stroke: none; }

/* 별점 정보 */
.rating-info { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; color: #666; margin-bottom: 6px; }
.star { color: #ffcc00; font-size: 1rem; }
.rating-val { font-weight: 700; color: #333; }
.divider { color: #eee; margin: 0 6px; font-size: 0.7rem; }

/* 배달 정보 행 */
.delivery-info { display: flex; align-items: center; font-size: 0.82rem; color: #777; white-space: nowrap; }
.check-icon { color: #169750; font-weight: 800; margin-right: 4px; }
.delivery-tip { color: #169750; font-weight: 700; }
.min-order { color: #888; }

/* 페이징 스타일 */
.pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 40px; padding-bottom: 40px; }
.page-num, .page-nav { width: 36px; height: 36px; border: 1px solid #eee; background: #fff; border-radius: 8px; font-size: 0.9rem; font-weight: 600; color: #666; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.page-num.active { background: #ff4d6d; color: #fff; border-color: #ff4d6d; }
.page-nav:disabled { color: #ddd; cursor: not-allowed; }

/* 빈 목록 상태 */
.empty-wish { text-align: center; padding: 80px 0; color: #bbb; }
.empty-icon { font-size: 3rem; display: block; margin-bottom: 10px; }
.go-main-btn { margin-top: 15px; padding: 10px 24px; background:#a40C0b; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }
</style>
