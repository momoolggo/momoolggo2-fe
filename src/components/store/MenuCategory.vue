<script setup>
import { ref } from 'vue';
import MenuItem from '@/components/store/MenuCard.vue';

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
  background-color: #fff;
  margin-bottom: 5px;
}

.category-header {
  background-color: #f8f8f8;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;

  /* --- 수정된 부분: 고정 기능을 해제합니다 --- */
  position: relative; /* sticky 대신 relative 사용 */
  top: 0;            /* 60px에서 0으로 변경 혹은 제거 */
  z-index: 1;        /* 다른 요소와 꼬이지 않게 낮게 설정 */
}

.menu-list {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  background-color: #ffffff;
}
</style>
