<script setup>
import { ref } from 'vue';
import MenuItem from '@/components/MenuCard.vue';

const props = defineProps({
  categoryName: String,
  items: Array
});

// 각 카테고리 컴포넌트가 스스로 열림/닫힘 상태를 가짐
const isOpen = ref(true);

const toggleCategory = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="menu-category-group">
    <div class="category-header" @click="toggleCategory" style="cursor: pointer;">
      <h2>{{ categoryName }}</h2>
      <span class="icon">{{ isOpen ? '▲' : '▼' }}</span>
    </div>

    <div v-show="isOpen" class="menu-list">
      <MenuItem
    v-for="menu in items"
    :key="menu.id"
    :menu="menu"
    @click-menu="$emit('click-menu', menu)"
/>
    </div>
  </div>
</template>

<style scoped>
.menu-category-group {
  width: 100%;
  background-color: #fff; /* 전체 배경은 흰색 */
  margin-bottom: 5px;
}

.category-header {
  background-color: #f8f8f8; /* 카테고리 바만 연한 회색 */
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  position: sticky; /* 스크롤 시 카테고리 고정 (선택 사항) */
  top: 60px;
  z-index: 5;
}

.menu-list {
  display: flex;
  flex-direction: column;
  padding: 10px 0; /* 카드들이 들어갈 위아래 여백 */
  background-color: #ffffff;
}
</style>
