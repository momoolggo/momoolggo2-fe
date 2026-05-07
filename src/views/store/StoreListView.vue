<script setup>
import { computed, reactive, onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StoreCard from '@/components/store/StoreCard.vue';
import storeService from '@/services/storeService';

const router = useRouter();
const route = useRoute();
const scrollContainer = ref(null);
const showSortMenu = ref(false);

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

const sortOptions = [
    { value: 'order_count',  label: '주문수' },
    { value: 'created_at',   label: '등록일' },
    { value: 'min_price',    label: '최소주문금액' },
    { value: 'rating_count', label: '리뷰수' },
    { value: 'rating_avg',   label: '평점' },
];

const storeList = reactive({
    list: [],
    find: {
        searchText: '',
        size: 5,
        currentPage: 1,
        categoryId: 0,
        maxPage: 10,
        sortType: 'order_count',
        sortOrder: 'DESC',
    },
});

// 현재 정렬 라벨
const currentSortLabel = computed(() => {
    const found = sortOptions.find(o => o.value === storeList.find.sortType);
    const dir = storeList.find.sortOrder === 'DESC' ? '▼' : '▲';
    return found ? `${found.label} ${dir}` : '주문수 ▼';
});

// 가게 조회
const getStores = async () => {
    const params = {
        searchText:  storeList.find.searchText,
        size:        storeList.find.size,
        currentPage: storeList.find.currentPage,
        categoryId:  storeList.find.categoryId,
        sortType:    storeList.find.sortType,
        sortOrder:   storeList.find.sortOrder,
    };
    try {
        const maxResult = await storeService.getMaxStore(params);
        storeList.find.maxPage = Math.ceil(maxResult.resultData / storeList.find.size);
        const result = await storeService.getStoreList(params);
        if (result && result.resultData) {
            const data = result.resultData;
            storeList.list = data.list || data;
        }
    } catch (error) {
        console.error("가게 목록 조회 실패", error);
    }
};

// 카테고리 변경
const changeCategory = (name) => {
    router.push({
        query: { ...route.query, category: name }
    });
};

// 정렬 기준 변경 - 창 닫지 않음
const changeSortType = (value) => {
    storeList.find.sortType = value;
    storeList.find.currentPage = 1;
    getStores();
};

// 정렬 방향 변경 - 창 닫지 않음
const changeSortOrder = (order) => {
    storeList.find.sortOrder = order;
    storeList.find.currentPage = 1;
    getStores();
};

// 주소에 있는 카테고리명 아이디로 변환
const getCategoryIdByName = (name) => {
    const found = categories.find(c => c.name === name);
    return found ? found.id : 0;
};

// 카테고리 바뀌면 새로 조회
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

// 페이징 처리
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

// 페이지 변경
const changePage = (page) => {
    if (page < 1 || page > storeList.find.maxPage) return;
    storeList.find.currentPage = page;
    getStores();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 가게 상세로 이동
const goToDetail = (store) => {
    if (store.state === 0) return;
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

    <!-- 헤더 + 정렬버튼 -->
    <header class="header">
        <h2>{{ currentCategoryName }}</h2>
        <div class="sort-wrap">
            <button class="sort-toggle-btn" @click="showSortMenu = !showSortMenu">
                {{ currentSortLabel }}
            </button>

            <!-- 정렬 드롭다운 -->
            <div class="sort-dropdown" v-if="showSortMenu">

                <!-- 정렬 기준 -->
                <div class="sort-section-title">정렬 기준</div>
                <button
                    v-for="opt in sortOptions"
                    :key="opt.value"
                    class="sort-option"
                    :class="{ active: storeList.find.sortType === opt.value }"
                    @click="changeSortType(opt.value)"
                >
                    {{ opt.label }}
                    <span v-if="storeList.find.sortType === opt.value" class="check-mark">✓</span>
                </button>

                <div class="sort-divider" />

                <!-- 정렬 방향 -->
                <div class="sort-section-title">정렬 방향</div>
                <div class="sort-order-row">
                    <button
                        class="sort-order-btn"
                        :class="{ active: storeList.find.sortOrder === 'DESC' }"
                        @click="changeSortOrder('DESC')"
                    >▼ 내림차순</button>
                    <button
                        class="sort-order-btn"
                        :class="{ active: storeList.find.sortOrder === 'ASC' }"
                        @click="changeSortOrder('ASC')"
                    >▲ 오름차순</button>
                </div>

            </div>
        </div>
    </header>

    <!-- 바깥 클릭시 닫기 오버레이 -->
    <div class="sort-overlay" v-if="showSortMenu" @click="showSortMenu = false" />

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

    <div class="pagination" v-if="storeList.find.maxPage >= 1">

        <!-- 이전 그룹 -->
        <button
            class="page-nav-btn"
            :disabled="storeList.find.currentPage <= PAGE_GROUP_SIZE"
            @click="changePage(pageRange[0] - 1)"
        >이전</button>

        <!-- 페이지 번호들 -->
        <button
            v-for="page in pageRange"
            :key="page"
            class="page-num"
            :class="{ active: storeList.find.currentPage === page }"
            @click="changePage(page)"
        >{{ page }}</button>

        <!-- 다음 그룹 -->
        <button
            class="page-nav-btn"
            :disabled="pageRange[pageRange.length - 1] >= storeList.find.maxPage"
            @click="changePage(pageRange[pageRange.length - 1] + 1)"
        >다음</button>

    </div>

</div>
</template>

<style scoped>
.store-list-view {
    max-width: 480px;
    margin: 0 auto;
    background: #f8f8f8;
    min-height: 100vh;
    padding-bottom: 120px;
    position: relative;
}

.category-nav { position: sticky; top: 0; z-index: 100; background: #fff; display: flex; align-items: center; border-bottom: 1px solid #eee; }
.category-scroll-wrapper { display: flex; overflow-x: auto; scroll-behavior: smooth; padding: 15px 10px; scrollbar-width: none; flex: 1; }
.category-scroll-wrapper::-webkit-scrollbar { display: none; }
.category-item { min-width: 75px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; cursor: pointer; border-bottom: 3px solid transparent; padding-bottom: 8px; }
.cat-icon { font-size: 24px; margin-bottom: 4px; }
.cat-name { font-size: 13px; color: #666; }
.category-item.active .cat-name { color: #a40C0b; font-weight: bold; }
.category-item.active { border-bottom: 3px solid #a40C0b; }
.nav-btn { width: 40px; border: none; background: #fff; cursor: pointer; font-size: 18px; color: #333; }
.store-closed { opacity: 0.45; filter: grayscale(60%); cursor: not-allowed; pointer-events: none; }

/* 헤더 */
.header {
    padding: 16px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 201;
}
.header h2 { margin: 0; font-size: 18px; }

/* 정렬 wrapper */
.sort-wrap { position: relative; }

.sort-toggle-btn {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    background: #fff;
    font-size: 13px;
    color: #333;
    cursor: pointer;
    white-space: nowrap;
}

/* 드롭다운 */
.sort-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    z-index: 300;
    min-width: 160px;
    overflow: hidden;
}

.sort-section-title {
    padding: 8px 16px 4px;
    font-size: 11px;
    color: #999;
    font-weight: bold;
    letter-spacing: 0.5px;
}

.sort-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 10px 16px;
    border: none;
    background: #fff;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    text-align: left;
}
.sort-option:hover { background: #fdf5f5; }
.sort-option.active { color: #a40C0b; font-weight: bold; }
.check-mark { font-size: 13px; color: #a40C0b; }

.sort-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 4px 0;
}

/* 오름차/내림차 버튼 행 */
.sort-order-row {
    display: flex;
    gap: 8px;
    padding: 8px 12px 12px;
}
.sort-order-btn {
    flex: 1;
    padding: 7px 0;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    font-size: 13px;
    color: #666;
    cursor: pointer;
    text-align: center;
}
.sort-order-btn:hover { background: #fdf5f5; }
.sort-order-btn.active {
    background: #a40C0b;
    color: #fff;
    border-color: #a40C0b;
    font-weight: bold;
}

/* 바깥 클릭 닫기 오버레이 */
.sort-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
}

.list-container { display: flex; flex-direction: column; background: #fff; }
.empty-msg { padding: 100px 20px; text-align: center; color: #999; }

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 40px 0;
    background: #f8f8f8;
    position: relative;
    z-index: 10;
}
.page-num, .page-nav-btn {
    min-width: 36px; height: 36px; border: 1px solid #ddd; background: #fff;
    border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;
}
.page-num.active { background: #a40C0b; color: #fff; border-color: #a40C0b; font-weight: bold; }
.page-nav-btn:disabled { color: #ddd; cursor: not-allowed; }
</style>
