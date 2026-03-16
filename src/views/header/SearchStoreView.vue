<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, reactive, onMounted, watch } from 'vue';
import StoreCard from '@/components/store/StoreCard.vue';
import storeService from '@/services/storeService';


const route= useRoute();
const router= useRouter();

const search = ref('');

const state = reactive({
    list: [],
    find: {
    searchText: ''
}
});

onMounted (async () => {
    if (route.query.search_text) {
        state.list = await storeService.getSearchStore({ search_text: route.query.search_text })
    }
})

const goToDetail = (id) => {
    router.push({ path: '/store', query: { id } })
};

watch( 
    () => route.query.search_text, async (newVal)  => 
    { state.list = await storeService.getSearchStore( { search_text: newVal}) }
);
</script>

<template>

<div class="search-store">
    <StoreCard v-for="store in state.list"
    :key="store.id"
    :store="store"
    @click="goToDetail(store.id)" />
</div>

</template>

<style scoped>

</style>