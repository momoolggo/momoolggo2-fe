<script setup>
import { computed, reactive, onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StoreCard from '@/components/store/StoreCard.vue';
import storeService from '@/services/storeService';

const router = useRouter();
const route = useRoute();
const scrollContainer = ref(null);

const categories = [
    { id: 0,  name: '전체',      icon: '🏠' },
    { id: 1,  name: '한식',      icon: '🥘' },
    { id: 2,  name: '중식',      icon: '🥟' },
    { id: 3,  name: '일식',      icon: '🍣' },
    { id: 4,  name: '양식',      icon: '🍝' },
    { id: 5,  name: '디저트',    icon: '🍰' },
    { id: 6,  name: '분식',      icon: '🍢' },
    { id: 7,  name: '패스트푸드', icon: '🍔' },
    { id: 8,  name: '찜·탕',     icon: '🍲' },
    { id: 9,  name: '치킨',      icon: '🍗' },
    { id: 10, name: '야식',      icon: '🌛' },
    { id: 11, name: '족발',      icon: '🐷' },
    { id: 12, name: '피자',      icon: '🍕' },
];

const storeList = reactive({
    list: [],
    find: {
        searchText: '',
        size: 5,
        currentPage: 1,
        categoryId: 0,
        maxPage: 10,
    },
});

const getStores = async () => {
    const params = {
        searchText: storeList.find.searchText,
        size: storeList.find.size,
        currentPage: storeList.find.currentPage,
        categoryId: storeList.find.categoryId,
    };
    try {
        const result = await storeService.getStoreList(params);
        if (result && result.resultData) {
            // 서버 응답 구조가 { list: [], totalCount: n } 일 경우를 대비
            const data = result.resultData;
            storeList.list = data.list || data;

            // maxPage 계산 로직 (전체 개수가 올 경우)
            const totalCount = data.totalCount || 0;
            if (totalCount > 0) {
                storeList.find.maxPage = Math.ceil(totalCount / storeList.find.size);
            } else {
                storeList.find.maxPage = 10; // 테스트용 고정값 유지 원할 시
            }
        }
    } catch (error) {
        console.error("가게 목록 조회 실패", error);
    }
};

const changeCategory = (name) => {
  router.push({
    query: { ...route.query, category: name }
  });
};

const getCategoryIdByName = (name) => {
  const found = categories.find(c => c.name === name);
  return found ? found.id : 0;
};

watch(() => route.query.category, (newCategory) => {
  storeList.find.categoryId = getCategoryIdByName(newCategory);
  storeList.find.currentPage = 1;
  getStores();
}, { immediate: true });

const scroll = (direction) => {
    if (scrollContainer.value) {
        scrollContainer.value.scrollBy({
            left: direction === 'left' ? -300 : 300,
            behavior: 'smooth',
        });
    }
};

const PAGE_GROUP_SIZE = 5;
const pageRange = computed(() => {
    const max = storeList.find.maxPage;
    const current = storeList.find.currentPage;
    if (max <= 0) return [];
    const start = Math.floor((current - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
    let end = Math.min(start + PAGE_GROUP_SIZE - 1, max);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
});

onMounted(getStores);

const changePage = (page) => {
    if (page < 1 || page > storeList.find.maxPage) return;
    storeList.find.currentPage = page;
    getStores();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const goToDetail = (store) => {
    if (store.state === 0){
        return
    }
    router.push(`/store/${store.id}`);
};

const currentCategoryName = computed(() => {
    const found = categories.find(c => c.id === storeList.find.categoryId);
    return found ? found.name : '전체';
});
</script>

<template>
<div class="store-list-view">

    <nav class="category-nav">
        <button class="nav-btn left" @click="scroll('left')">〈</button>
        <div class="category-scroll-wrapper" ref="scrollContainer">
            <div
                v-for="cat in categories"
                :key="cat.id"
                class="category-item"
                :class="{ active: storeList.find.categoryId === cat.id }"
                @click="changeCategory(cat.name)"
            >
                <span class="cat-icon">{{ cat.icon }}</span>
                <span class="cat-name">{{ cat.name }}</span>
            </div>
        </div>
        <button class="nav-btn right" @click="scroll('right')">〉</button>
    </nav>

    <header class="header">
        <h2>{{ currentCategoryName }}</h2>
    </header>

    <div class="list-container">
        <StoreCard
            v-for="store in storeList.list"
            :key="store.id"
            :store="store"
            @click="goToDetail(store)"
        />
    </div>

    <div v-if="storeList.list.length === 0" class="empty-msg">
        등록된 가게가 없습니다.
    </div>

    <div class="pagination" v-if="storeList.find.maxPage > 1">
        <button
            class="page-nav-btn"
            :disabled="storeList.find.currentPage === 1"
            @click="changePage(storeList.find.currentPage - 1)"
        >이전</button>

        <button
            v-for="page in pageRange"
            :key="page"
            class="page-num"
            :class="{ active: storeList.find.currentPage === page }"
            @click="changePage(page)"
        >{{ page }}</button>

        <button
            class="page-nav-btn"
            :disabled="storeList.find.currentPage === storeList.find.maxPage"
            @click="changePage(storeList.find.currentPage + 1)"
        >다음</button>
    </div>

</div>
</template>

<style scoped>
/* 1. 하단 패딩을 주어 네비게이션 바 공간 확보 */
.store-list-view {
    max-width: 480px;
    margin: 0 auto;
    background: #f8f8f8;
    min-height: 100vh;
    padding-bottom: 120px; /* 네비바 높이(약 60px) + 여유공간 */
    position: relative;
}

.category-nav { position: sticky; top: 0; z-index: 100; background: #fff; display: flex; align-items: center; border-bottom: 1px solid #eee; }
.category-scroll-wrapper { display: flex; overflow-x: auto; scroll-behavior: smooth; padding: 15px 10px; scrollbar-width: none; flex: 1; }
.category-scroll-wrapper::-webkit-scrollbar { display: none; }
.category-item { min-width: 75px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; cursor: pointer; border-bottom: 3px solid transparent; padding-bottom: 8px; }
.cat-icon { font-size: 24px; margin-bottom: 4px; }
.cat-name { font-size: 13px; color: #666; }
.category-item.active .cat-name { color:#a40C0b; font-weight: bold; }
.category-item.active { border-bottom: 3px solid#a40C0b; }
.nav-btn { width: 40px; border: none; background: #fff; cursor: pointer; font-size: 18px; color: #333; }
.store-closed { opacity: 0.45; filter: grayscale(60%); cursor: not-allowed; pointer-events: none;}
.header { padding: 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.list-container { display: flex; flex-direction: column; background: #fff; }
.empty-msg { padding: 100px 20px; text-align: center; color: #999; }

/* 2. 페이징 영역 스타일링 및 z-index 상향 */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 40px 0;
    background: #f8f8f8;
    position: relative;
    z-index: 10; /* 네비게이션 바보다 낮되 일반 요소보다는 높게 */
}
.page-num, .page-nav-btn {
    min-width: 36px; height: 36px; border: 1px solid #ddd; background: #fff;
    border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;
}
.page-num.active { background: #a40C0b; color: #fff; border-color: #a40C0b; font-weight: bold; }
.page-nav-btn:disabled { color: #ddd; cursor: not-allowed; }
</style>
