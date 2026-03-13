<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import storeService from '@/services/storeService';

const router = useRouter();

const state = reactive({
    wishList: [],
    totalCount: 0,
    currentPage: 1,
    pageSize: 5,
});

const loadWishList = async () => {
    try {
        const res = await storeService.getWishList();
        state.wishList = res.resultData || [];
        state.totalCount = state.wishList.length;
    } catch (e) {
        console.error('찜 목록 로드 실패:', e);
        state.wishList = [];
    }
};
onMounted(loadWishList);

// 페이지네이션
const totalPages = computed(() => Math.ceil(state.totalCount / state.pageSize));
const pagedList = computed(() => {
    const start = (state.currentPage - 1) * state.pageSize;
    return state.wishList.slice(start, start + state.pageSize);
});

const goPage = (page) => {
    if (page < 1 || page > totalPages.value) return;
    state.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 찜 해제
const toggleWish = async (store) => {
    try {
        await storeService.toggleWish(store.storeId);
        state.wishList = state.wishList.filter(s => s.storeId !== store.storeId);
        state.totalCount = state.wishList.length;
    } catch (e) {
        console.error('찜 해제 실패:', e);
    }
};

// 가게 상세로 이동
const goStore = (storeId) => {
    router.push(`/store/${storeId}`);
};
</script>

<template>
<div class="wish-page">
    <h2 class="page-title">찜 목록</h2>
    <p class="total-count">총 {{ state.totalCount }}개</p>

    <!-- 찜 목록 -->
    <div class="wish-list" v-if="state.wishList.length > 0">
        <div
            v-for="store in pagedList"
            :key="store.storeId"
            class="wish-card"
            @click="goStore(store.storeId)"
        >
            <img
                :src="store.storePic || '/images/default-store.png'"
                class="store-img"
                :alt="store.storeName"
            />

            <div class="card-body">
                <div class="card-header">
                    <span class="store-name">{{ store.storeName }}</span>
                    <button
                        class="wish-btn active"
                        @click.stop="toggleWish(store)"
                        title="찜 해제"
                    >♥</button>
                    <span class="rating">
                        ⭐ {{ store.ratingAvg }}({{ store.ratingCount }})
                    </span>
                </div>

                <p class="order-count">총 주문수 {{ store.orderCount?.toLocaleString() || 0 }}건</p>

                <div class="card-specs">
                    <div class="spec-row">
                        <span class="spec-label">배달팁</span>
                        <span class="spec-val">1,500원</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">최소 주문</span>
                        <span class="spec-val">{{ store.minPrice?.toLocaleString() || 0 }}원</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 찜 없을 때 -->
    <div class="empty-wish" v-else>
        <span class="empty-icon">🤍</span>
        <p>찜한 가게가 없습니다</p>
        <button class="go-main-btn" @click="router.push('/')">가게 둘러보기</button>
    </div>

    <!-- 페이지네이션 -->
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
.wish-page {
    max-width: 820px;
    margin: 0 auto;
    padding: 40px 20px 80px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.page-title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 6px;
    color: #111;
}

.total-count {
    font-size: 0.88rem;
    color: #888;
    margin-bottom: 20px;
}

/* 카드 리스트 */
.wish-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.wish-card {
    display: flex;
    gap: 0;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.15s;
    background: #fff;
}
.wish-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.09);
    transform: translateY(-2px);
}

.store-img {
    width: 140px;
    height: 120px;
    object-fit: cover;
    flex-shrink: 0;
    background: #f0f0f0;
}

/* 카드 본문 */
.card-body {
    flex: 1;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2px;
}

.store-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: #111;
}

.wish-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #ccc;
    padding: 0;
    line-height: 1;
    transition: color 0.2s;
}
.wish-btn.active { color: #ff4d6d; }
.wish-btn:hover { color: #ff4d6d; }

.rating {
    font-size: 0.88rem;
    color: #555;
    margin-left: auto;
}

.order-count {
    font-size: 0.83rem;
    color: #999;
    margin: 0;
}

.card-specs {
    display: flex;
    gap: 40px;
    margin-top: 6px;
}

.spec-row {
    display: flex;
    gap: 20px;
    font-size: 0.85rem;
}

.spec-label { color: #aaa; }
.spec-val { color: #333; font-weight: 500; }

/* 빈 찜 목록 */
.empty-wish {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 80px 0;
    color: #bbb;
}

.empty-icon { font-size: 3rem; }
.empty-wish p { font-size: 1rem; color: #aaa; }

.go-main-btn {
    margin-top: 6px;
    padding: 10px 24px;
    background: #4A90E2;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
}
.go-main-btn:hover { background: #357ABD; }

/* 페이지네이션 */
.pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 40px;
}

.pagination button {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    background: #fff;
    font-size: 0.9rem;
    color: #555;
    cursor: pointer;
    transition: all 0.15s;
}
.pagination button:hover {
    border-color: #4A90E2;
    color: #4A90E2;
}
.pagination button.active {
    background: #4A90E2;
    color: #fff;
    border-color: #4A90E2;
    font-weight: 600;
}
</style>
