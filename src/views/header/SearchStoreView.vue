<script setup>
import { useRoute, useRouter } from 'vue-router';
import { reactive, onMounted, watch } from 'vue';
import StoreCard from '@/components/store/StoreCard.vue';
import storeService from '@/services/storeService';


const route= useRoute();
const router= useRouter();

const state = reactive({
    list: [],
    find: {
    searchText: ''
}
});

onMounted ( async () => {
    if (route.query.search_text?.trim()) {
        const res = await storeService.getSearchStore({ search_text: route.query.search_text })
        state.list = res.resultData
    }
})

const goToDetail = (id) => {
    router.push({ path: `/store/${id}`, query: { id } })
};

watch(
    () => route.query.search_text,
    async (newVal) => {
    if (!newVal?.trim()) {
        state.list = []
        return
    }
    const res = await storeService.getSearchStore({ search_text: newVal })
    state.list = res.resultData
    }
)


</script>

<template>


<div class="search-container">
    
    <div v-if="! route.query.search_text?.trim()" class="no-result">
        <span class="no-result-icon">⚠️</span>
        <p>검색 결과가 없습니다</p>
        <button class="search-again-btn" @click="router.push('/home')">다시 검색하기</button>
        </div>
        <div v-else-if="state.list.length === 0" class="no-result">
        <span class="no-result-icon">⚠️</span>
        <p>검색 결과가 없습니다</p>
        <button class="search-again-btn" @click="router.push('/home')">다시 검색하기</button>
        </div>
        <div v-else>
            <StoreCard v-for="store in state.list"
            :key="store.id"
            :store="store"
            @click="goToDetail(store.id)" />
        </div>
            </div>
</template>

<style scoped>

.search-container {
    max-width: 480px;
    margin: 0 auto;
    margin-top: 25px;
    margin-bottom: 10px;
}

.no-result{
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    height: 480px; 
    gap: 14px; 
    background: #fafafa;
    font-family: 'NanumSquare_acB', sans-serif;
}

.no-result-icon { font-size: 40px }
.no-result p { font-size: 20px; color: #999; font-weight: 500; }

.search-again-btn { margin-top: 15px; padding: 10px 24px; 
background: #3181E7; color: white; 
border: none; border-radius: 8px; 
cursor: pointer; }
</style>