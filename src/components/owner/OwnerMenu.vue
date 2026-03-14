<script setup>
import { ref, computed } from 'vue';
import MenuCard from '@/components/customer/MenuCard.vue';
import CategoryModal from '@/components/owner/CategoryModal.vue';
import MenuAddModal from '@/components/owner/MenuAddModal.vue';

const isCategoryModalOpen = ref(false);
const isMenuAddModalOpen = ref(false);

const allCategories = ref([
  { id: 1, name: '1인분 메뉴' },
  { id: 2, name: '인기메뉴' },
  { id: 3, name: '메인메뉴' }
]);

const selectedCategories = ref([
  { id: 1, name: '1인분 메뉴' }
]);

const updateCategories = (payload) => {
  allCategories.value = payload.all;
  selectedCategories.value = payload.selected;
  isCategoryModalOpen.value = false;
};

// MenuCard가 사용하는 필드명: menuName, menuInfo, price, menuPic, soldout
const menuList = ref([
  { id: 1, menuName: '참돔 오차즈케', menuInfo: '밥 + 국산 참돔 + 녹차 + 후리카케 + 김 + 장국 구성입니다.', price: 21000, menuPic: null, soldout: 0, categoryId: 1 },
  { id: 2, menuName: '연어 오차즈케', menuInfo: '밥 + 노르웨이산 연어 + 녹차 + 후리카케 + 김 구성입니다.', price: 19000, menuPic: null, soldout: 0, categoryId: 1 },
  { id: 3, menuName: '명란 오차즈케', menuInfo: '밥 + 명란젓 + 녹차 + 후리카케 + 김 구성입니다.', price: 17000, menuPic: null, soldout: 1, categoryId: 2 },
]);

const groupedMenus = computed(() => {
  return selectedCategories.value.map(cat => ({
    category: cat,
    menus: menuList.value.filter(menu => menu.categoryId === cat.id)
  }));
});

const addMenu = (menuData) => {
  menuList.value.push({
    id: Date.now(),
    menuName: menuData.name,
    menuInfo: menuData.description,
    price: menuData.price ? Number(menuData.price) : 0,
    menuPic: menuData.image ? URL.createObjectURL(menuData.image) : null,
    soldout: 0,
    categoryId: menuData.categoryId
  });
  isMenuAddModalOpen.value = false;
};
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
        <template v-for="group in groupedMenus" :key="group.category.id">
          <p class="category-title">{{ group.category.name }}</p>
          <div class="menu-grid">
            <MenuCard v-for="item in group.menus" :key="item.id" :menu="item" />
          </div>
        </template>
      </section>

      <CategoryModal
        v-if="isCategoryModalOpen"
        :initialCategories="allCategories || []"
        :initialSelected="selectedCategories || []"
        @close="isCategoryModalOpen = false"
        @save="updateCategories"
      />

      <MenuAddModal
        v-if="isMenuAddModalOpen"
        :categories="selectedCategories"
        @close="isMenuAddModalOpen = false"
        @save="addMenu"
      />
    </main>
  </div>
</template>

<style scoped>
.owner-layout { display: flex; background-color: #f9f9f9; min-height: 100vh; }
.main-content { flex: 1; padding: 40px; }
.menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.header-left { display: flex; align-items: center; gap: 20px; }
.btn-category { padding: 8px 16px; border-radius: 8px; border: 1px solid #ddd; background: #fff; cursor: pointer; }
.btn-add-menu { padding: 10px 20px; border-radius: 8px; border: none; background: #eee; color: #666; cursor: pointer; font-weight: bold; }
.category-title { font-size: 16px; color: #888; margin-bottom: 20px; }
.menu-grid { display: flex; flex-direction: column; gap: 15px; }
</style>