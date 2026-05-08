import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useStore = defineStore('store', () => {

  const myStore = ref(null);
  const myStoreId = ref(null);
  const myStores = ref([]);
  const storeState = ref(1);

  function setStore(storeName, storeId) {
    myStore.value = storeName;
    myStoreId.value = storeId;
  }

  function setStores(stores) {
    myStores.value = stores;
    if (stores && stores.length > 0 && !myStoreId.value) {
      myStore.value = stores[0].storeName;
      myStoreId.value = stores[0].storeId;
      storeState.value = stores[0].state ?? 1;
    }
  }

  function switchStore(storeId) {
    const found = myStores.value.find(s => s.storeId === storeId);
    if (found) {
      myStore.value = found.storeName;
      myStoreId.value = found.storeId;
      storeState.value = found.state ?? 1;
    }
  }

  const hasStore = computed(() => myStores.value.length > 0);

  function clearStore() {
    myStore.value = null;
    myStoreId.value = null;
    myStores.value = [];
  }

  const setStoreState = (val) => { storeState.value = val; }

  return { myStore, myStoreId, myStores, hasStore, storeState, setStore, setStores, switchStore, clearStore, setStoreState };
}, { persist: true })