<script setup>
import { computed, reactive, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import StoreCard from '@/components/StoreCard.vue';
import storeService from '@/services/storeService'; 

const router = useRouter();
const scrollContainer = ref(null); // 화살표 스크롤용 ref

// --- 카테고리 데이터 (DB 이미지 기준) ---
const categories = [
    { id: 0,  name: '전체',     icon: '🏠' },
    { id: 1,  name: '한식',     icon: '🥘' },
    { id: 2,  name: '중식',     icon: '🥟' },
    { id: 3,  name: '일식',     icon: '🍣' },
    { id: 4,  name: '양식',     icon: '🍝' },
    { id: 5,  name: '디저트',   icon: '🍰' },
    { id: 6,  name: '분식',     icon: '🍢' },
    { id: 7,  name: '패스트푸드', icon: '🍔' },
    { id: 8,  name: '찜·탕',    icon: '🍲' },
    { id: 9,  name: '치킨',     icon: '🍗' },
    { id: 10, name: '야식',     icon: '🌛' },
    { id: 11, name: '족발',     icon: '🐷' },
    { id: 12, name: '피자',     icon: '🍕' }
];

const storeList = reactive({
    list: [],
    find: {
        searchText: '',
        size: 50,
        currentPage: 1,
        categoryId: 0,
        maxPage: 0 
    },
    relatedSearchList: []
});

// --- 카테고리 변경 함수 ---
const changeCategory = (id) => {
    storeList.find.categoryId = id;
    storeList.find.currentPage = 1; // 카테고리 변경 시 1페이지로 리셋
    getStores();
};

// --- 화살표 스크롤 함수 ---
const scroll = (direction) => {
    if (scrollContainer.value) {
        const scrollAmount = 250; 
        scrollContainer.value.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
};

// --- 페이징 로직 ---
const PAGE_GROUP_SIZE = 5;
const pageRange = computed(() => {
    const max = storeList.find.maxPage;
    const current = storeList.find.currentPage;
    if (max <= 0) return [];
    const start = Math.floor((current - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
    let end = start + PAGE_GROUP_SIZE - 1;
    if (end > max) end = max;
    const pages = [];
    for (let i = start; i <= end; i++) { pages.push(i); }
    return pages;
});

// --- API 데이터 호출 ---
const getStores = async () => {
    const params = {
        searchText: storeList.find.searchText,
        size: storeList.find.size,
        currentPage: storeList.find.currentPage,
        categoryId: storeList.find.categoryId
    };
    try {
        const result = await storeService.getstorelist(params);
        if (result.resultData) {
            storeList.list = result.resultData; 
        }
    } catch (error) {
        console.error("가게 목록 조회 실패", error);
    }
};

onMounted(getStores);

const changePage = (page) => {
    storeList.find.currentPage = page;
    getStores();
    window.scrollTo(0, 0);
};

const goToDetail = (id) => {
    router.push(`/store/${id}`);
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
                @click="changeCategory(cat.id)"
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
            @click="goToDetail(store.id)"
        />
    </div>

    <div v-if="storeList.list.length === 0" class="empty-msg">
        등록된 가게가 없습니다.
    </div>

    <div class="pagination" v-if="storeList.find.maxPage > 0">
        <button 
            :disabled="storeList.find.currentPage <= PAGE_GROUP_SIZE" 
            @click="changePage(pageRange[0] - 1)"
        >이전</button>
        <button 
            v-for="page in pageRange" 
            :key="page"
            :class="{ active: storeList.find.currentPage === page }"
            @click="changePage(page)">
            {{ page }}
        </button>
        <button 
            :disabled="pageRange[pageRange.length - 1] >= storeList.find.maxPage" 
            @click="changePage(pageRange[pageRange.length - 1] + 1)"
        >다음</button>
    </div>
</div>
</template>

<style scoped>
.store-list-view { max-width: 600px; margin: 0 auto; background: #f8f8f8; min-height: 100vh; }

/* 카테고리 네비게이션 스타일 */
.category-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
}

.category-scroll-wrapper {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 15px 10px;
    scrollbar-width: none;
}
.category-scroll-wrapper::-webkit-scrollbar { display: none; }

.category-item {
    min-width: 80px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    padding-bottom: 5px;
}

.cat-icon { font-size: 24px; margin-bottom: 4px; }
.cat-name { font-size: 13px; color: #666; }

.category-item.active .cat-name { color: #00C7AE; font-weight: bold; }
.category-item.active { border-bottom: 2px solid #00C7AE; }

/* 화살표 버튼 */
.nav-btn {
    width: 30px;
    height: 30px;
    border: none;
    background: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    font-size: 18px;
    z-index: 10;
    color: #333;
}

/* 헤더 및 리스트 스타일 */
.header { padding: 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.list-container { display: flex; flex-direction: column; background: #fff; }
.empty-msg { padding: 50px; text-align: center; color: #999; background: #fff; }

/* 페이징 스타일 */
.pagination { display: flex; justify-content: center; gap: 5px; padding: 20px 0; background: #fff; }
.pagination button { padding: 8px 12px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; }
.pagination button.active { background: #00C7AE; color: #fff; border-color: #00C7AE; }
.pagination button:disabled { color: #ccc; cursor: default; }
</style>