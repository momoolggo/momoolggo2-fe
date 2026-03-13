<script setup>
import { ref } from 'vue';
import MenuCard from '@/components/MenuCard.vue';
import CategoryModal from '@/components/CategoryModal.vue';
import MenuAddModal from '@/components/MenuAddModal.vue';

const isCategoryModalOpen = ref(false);
const isMenuAddModalOpen = ref(false);

// 1. 부모가 관리하는 데이터 (서버에서 가져올 데이터의 원천)
const allCategories = ref([
  { id: 1, name: '1인분 메뉴' },
  { id: 2, name: '인기메뉴' },
  { id: 3, name: '메인메뉴' }
]);

const selectedCategories = ref([
  { id: 1, name: '1인분 메뉴' }
]);

// 2. 모달에서 저장 이벤트가 발생했을 때 데이터 업데이트
const updateCategories = (payload) => {
  allCategories.value = payload.all;
  selectedCategories.value = payload.selected;
  isCategoryModalOpen.value = false;
};

// 메뉴 리스트 더미 데이터
const menuList = ref([
  { id: 1, menuName: '참돔 오차즈케', price: '21,000원', description: '밥 + 국산 참돔 + 녹차 + 후리카케 + 김 + 장국 구성입니다.', img: 'link_to_img' },
]);
</script>

<template>
  <div class="owner-layout">
    <main class="main-content">
      <header class="menu-header">
        <div class="header-left">
          <h2>메뉴 관리</h2>
          <button class="btn-category" @click="isCategoryModalOpen = true">카테고리 관리</button>
        </div>
        <button class="btn-add-menu" @click="isMenuAddModalOpen = true">+ 메뉴 추가하기</button>
      </header>

      <section class="menu-list-section">
        <p class="category-title">1인분 메뉴</p>
        <div class="menu-grid">
          <MenuCard v-for="item in menuList" :key="item.id" :menu="item" />
        </div>
      </section>

      <CategoryModal 
        v-if="isCategoryModalOpen" 
        :initialCategories="allCategories || []"
        :initialSelected="selectedCategories || []"
        @close="isCategoryModalOpen = false"
        @save="updateCategories"
      />
      
      <MenuAddModal v-if="isMenuAddModalOpen" @close="isMenuAddModalOpen = false" />
    </main>
  </div>
</template>

<style scoped>
/* 이전과 동일한 스타일 유지 */
.owner-layout { display: flex; background-color: #f9f9f9; min-height: 100vh; }
.main-content { flex: 1; padding: 40px; }
.menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.header-left { display: flex; align-items: center; gap: 20px; }
.btn-category { padding: 8px 16px; border-radius: 8px; border: 1px solid #ddd; background: #fff; cursor: pointer; }
.btn-add-menu { padding: 10px 20px; border-radius: 8px; border: none; background: #eee; color: #666; cursor: pointer; font-weight: bold; }
.category-title { font-size: 16px; color: #888; margin-bottom: 20px; }
.menu-grid { display: flex; flex-direction: column; gap: 15px; }
</style>