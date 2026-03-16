import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStore = defineStore('store', () => {

  const myStore = ref(null);

 
  function setStore(storeName) {
    myStore.value = storeName;
  }

  
  function clearStore() {
    myStore.value = null;
  }

  return { myStore, setStore, clearStore };
});