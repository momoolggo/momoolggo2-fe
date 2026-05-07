import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useStore = defineStore('store', () => {

  // 현재 선택된 가게
  const myStore = ref(null);
  const myStoreId = ref(null);

  // 사장님이 보유한 전체 가게 목록
  const myStores = ref([]);

  // 가게 선택 (가게 전환 시)
  function setStore(storeName, storeId) {
    myStore.value = storeName;
    myStoreId.value = storeId;
  }

  // 가게 목록 설정 (로그인 시)
  function setStores(stores) {
    myStores.value = stores;
    // 목록이 있으면 첫 번째 가게를 기본 선택
    if (stores && stores.length > 0 && !myStoreId.value) {
      myStore.value = stores[0].storeName;
      myStoreId.value = stores[0].storeId;
    }
  }

  // 가게 전환
  function switchStore(storeId) {
    const found = myStores.value.find(s => s.storeId === storeId);
    if (found) {
      myStore.value = found.storeName;
      myStoreId.value = found.storeId;
    }
  }

  // 가게가 있는지 확인
  const hasStore = computed(() => myStores.value.length > 0);

  function clearStore() {
    myStore.value = null;
    myStoreId.value = null;
    myStores.value = [];
  }

  return { myStore, myStoreId, myStores, hasStore, setStore, setStores, switchStore, clearStore };
}, { persist: true })