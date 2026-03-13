<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import storeService from '@/services/storeService';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const auth = useAuthStore();
const user = computed(() => auth.state);

const state = reactive({
  wishList: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 6,
});

// 찜 목록 로드
const loadWishList = async () => {
  const params = {
    userNo: user.value.userNo,
    currentPage: state.currentPage,
    size: state.pageSize
  };
  try {
    const res = await storeService.getFavorite(params);
    // 서버 응답 구조: res.resultData.list
    if (res && res.resultData) {
      state.wishList = res.resultData.list || [];
      state.totalCount = res.resultData.totalCount || 0;
    }
  } catch (e) {
    console.error('찜 목록 로드 실패:', e);
    state.wishList = [];
  }
};

onMounted(loadWishList);

// 페이지네이션 계산
const totalPages = computed(() => Math.ceil(state.totalCount / state.pageSize));

// 페이지 이동
const goPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  state.currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 찜 해제 (클릭 시 색상 변경 및 목록 삭제)
const toggleWish = async (store) => {
  try {
    // 서버에 찜 해제 요청
    await storeService.toggleWish(store.id);

    // 1. 즉시 리스트에서 제거 (사용자 경험)
    state.wishList = state.wishList.filter(s => s.id !== store.id);
    // 2. 전체 개수 차감
    state.totalCount--;

    console.log(`${store.name} 찜 해제 완료`);
  } catch (e) {
    console.error('찜 해제 실패:', e);
    alert('찜 해제 중 오류가 발생했습니다.');
  }
};

// 가게 상세 이동
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
        <img
          :src="store.pic || '/images/default-store.png'"
          class="store-img"
          :alt="store.name"
        />

        <div class="card-body">
          <div class="card-header">
            <span class="store-name">{{ store.name }}</span>
            <span class="rating">
              ⭐ {{ store.avg }}({{ store.sum }})
            </span>
          </div>

          <p class="order-count">총 주문수 {{ store.count?.toLocaleString() || 0 }}건</p>

          <div class="card-specs">
            <div class="spec-row">
              <span class="spec-label">배달팁</span>
              <span class="spec-val">1,500원</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">최소 주문</span>
              <span class="spec-val">{{ store.min?.toLocaleString() || 0 }}원</span>
            </div>

            <button
              class="wish-btn active"
              @click.stop="toggleWish(store)"
              title="찜 해제"
            >
              <svg viewBox="0 0 24 24" class="heart-icon">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-wish" v-else>
      <span class="empty-icon">🤍</span>
      <p>찜한 가게가 없습니다</p>
      <button class="go-main-btn" @click="router.push('/')">가게 둘러보기</button>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: state.currentPage === page }"
        @click="goPage(page)"
      >{{ page }}</button>
    </div>
  </div>
</template>

<style scoped>
/* 페이지 레이아웃 */
.wish-page { max-width: 820px; margin: 0 auto; padding: 40px 20px 80px; }
.page-title { text-align: center; font-size: 1.5rem; font-weight: 600; margin-bottom: 6px; color: #111; }
.total-count { font-size: 0.88rem; color: #888; margin-bottom: 20px; }

/* 카드 스타일 */
.wish-list { display: flex; flex-direction: column; gap: 16px; }
.wish-card { display: flex; border: 1px solid #e8e8e8; border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s; background: #fff; }
.wish-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.09); transform: translateY(-2px); }

.store-img { width: 140px; height: 120px; object-fit: cover; flex-shrink: 0; background: #f0f0f0; }
.card-body { flex: 1; padding: 16px 20px; display: flex; flex-direction: column; justify-content: center; gap: 6px; }

.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
.store-name { font-size: 1.1rem; font-weight: 700; color: #111; }
.rating { font-size: 0.88rem; color: #555; margin-left: auto; }
.order-count { font-size: 0.83rem; color: #999; margin: 0; }

/* 하위 정보 영역 (하트 위치의 기준) */
.card-specs { position: relative; display: flex; gap: 40px; margin-top: 6px; }
.spec-row { display: flex; gap: 10px; font-size: 0.85rem; }
.spec-label { color: #aaa; }
.spec-val { color: #333; font-weight: 500; }

/* 예쁜 하트 버튼 스타일 */
.wish-btn {
  position: absolute;
  right: 1px;
  bottom: -5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.heart-icon {
  width: 2.4rem;
  height: 2.4rem;
  fill: #eee; /* 찜 해제 시 기본 색상 (연한 회색) */
  transition: fill 0.3s ease;
}

/* 찜 상태(active)일 때 색상 변경 */
.wish-btn.active .heart-icon {
  fill: #ff4d6d; /* 예쁜 분홍색 */
}

.wish-btn:hover {
  transform: scale(1.15);
}

/* 기타 UI */
.empty-wish { display: flex; flex-direction: column; align-items: center; padding: 80px 0; color: #bbb; }
.empty-icon { font-size: 3rem; }
.go-main-btn { margin-top: 15px; padding: 10px 24px; background: #4A90E2; color: #fff; border: none; border-radius: 8px; cursor: pointer; }

.pagination { display: flex; justify-content: center; gap: 6px; margin-top: 40px; }
.pagination button { width: 36px; height: 36px; border-radius: 6px; border: 1px solid #e0e0e0; background: #fff; cursor: pointer; }
.pagination button.active { background: #4A90E2; color: #fff; border-color: #4A90E2; }
</style>
