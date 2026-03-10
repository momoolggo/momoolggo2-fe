<script setup>
import { computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import StoreCard from '@/components/StoreCard.vue';
import axios from 'axios';

const router = useRouter();
const storeList = reactive({
    list: [],
    find: {
        searchText: '',
        size: 50,
        currentPage: 1,
        maxPage: 0 // 이 값은 API 응답에서 받아와야 합니다.
    },
    relatedSearchList: []
});

// --- [추가] 페이징 그룹 계산 로직 ---
const PAGE_GROUP_SIZE = 5; // 한 번에 보여줄 페이지 번호 개수

const pageRange = computed(() => {
    const max = storeList.find.maxPage;
    const current = storeList.find.currentPage;
    if (max <= 0) return [];

    // 현재 페이지가 속한 그룹의 시작/끝 번호 계산
    const start = Math.floor((current - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
    let end = start + PAGE_GROUP_SIZE - 1;
    if (end > max) end = max;

    const pages = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
});

// API로부터 가게 배열 데이터 가져오기
const getStores = async () => {
    const params = {
        searchText: storeList.find.searchText,
        size: storeList.find.size,
        currentPage: storeList.find.currentPage
    };
    try {
        const result = await axios.get('/api/stores', { params });
        if (result.data) {
            // 백엔드 응답 구조에 따라 수정 필요 (예: result.data.list)
            storeList.list = result.data; 
            // storeList.find.maxPage = result.data.maxPage; // 백엔드에서 넘겨주는 전체 페이지 수
        }
    } catch (error) {
        console.error("데이터 로딩 실패:", error);
        storeList.list = [
            { id: 1, name: '뭐물꼬 치킨', rating: 4.9, distance: 1.2, minOrderPrice: 15000, deliveryTip: 2000, thumbnail: '' },
            { id: 2, name: '대구 떡볶이', rating: 4.5, distance: 0.8, minOrderPrice: 12000, deliveryTip: 1000, thumbnail: '' }
        ];
        storeList.find.maxPage = 15; // 테스트용 임시 값
    }
};

// 페이지 변경 시 호출할 함수
const changePage = (page) => {
    storeList.find.currentPage = page;
    getStores();
    window.scrollTo(0, 0);
};

onMounted(getStores);

const goToDetail = (id) => {
    router.push(`/store/${id}`);
};
</script>

<template>
<div class="store-list-view">
    <header class="header">
        <h2>(카테고리 이름)</h2>
    </header>

    <div class="list-container">
        <StoreCard 
            v-for="store in storeList.list" 
            :key="store.id" 
            :store="store" 
            @click="goToDetail(store.id)"
        />
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
            @click="changePage(page)"
        >
            {{ page }}
        </button>

        <button 
            :disabled="pageRange[pageRange.length - 1] >= storeList.find.maxPage" 
            @click="changePage(pageRange[pageRange.length - 1] + 1)"
        >다음</button>
    </div>

    <div v-if="storeList.list.length === 0" class="empty-msg">
        등록된 가게가 없습니다.
    </div>
</div>
</template>

<style scoped>
/* 기존 스타일 유지 */
.store-list-view { max-width: 600px; margin: 0 auto; }
.header { padding: 16px; border-bottom: 1px solid #eee; }
.list-container { display: flex; flex-direction: column; }
.empty-msg { padding: 50px; text-align: center; color: #999; }

/* 페이징 스타일 추가 */
.pagination { display: flex; justify-content: center; gap: 5px; margin: 20px 0; }
.pagination button { padding: 5px 10px; border: 1px solid #ddd; background: #fff; cursor: pointer; }
.pagination button.active { background: #00C7AE; color: #fff; border-color: #00C7AE; }
.pagination button:disabled { color: #ccc; cursor: default; }
</style>