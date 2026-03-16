import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStore = defineStore('store', () => {

  const myStore = ref(null);
  const myStoreId = ref(null);

  function setStore(storeName, storeId) {
    myStore.value = storeName;
    myStoreId.value = storeId;
  }

  function clearStore() {
    myStore.value = null;
    myStoreId.value = null;
  }

  return { myStore, myStoreId, setStore, clearStore };
}, { persist: true })