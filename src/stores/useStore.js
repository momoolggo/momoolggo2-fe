import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStore = defineStore('store', () => {
  const myStores = ref(['코이보타루']);

  function addStore(storeName) {
    myStores.value.push(storeName);
  }

  return { myStores, addStore };
});