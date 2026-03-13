<script setup>
import { ref, computed } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import OrderCard from '@/components/OrderCard.vue';
import OrderList from '@/components/OrderList.vue';
import OwnerMenu from '@/components/OwnerMenu.vue';
import salesManagementView from '@/components/SalesManagementView.vue'

const currentMenu = ref('order'); // 기본값: 주문 관리

const formattedDate = computed(() => {
  const now = new Date();
  return `${now.getFullYear()} / ${String(now.getMonth() + 1).padStart(2, '0')} / ${String(now.getDate()).padStart(2, '0')}`;
});
</script>

<template>
  <div class="owner-layout">
    <Sidebar :activeMenu="currentMenu" @menu-change="menu => currentMenu = menu" />

    <main class="main-content">
      <template v-if="currentMenu === 'order'">
        <div class="date-container"><span class="date-text">📅 {{ formattedDate }}</span></div>
        <section class="summary-container">
          <OrderCard title="총 주문수" count="43" />
          <OrderCard title="주문수락대기" count="5" />
          <OrderCard title="배달 완료" count="35" />
          <OrderCard title="취소건수" count="3" type="cancel" />
        </section>
        <section class="order-list-section"><OrderList /></section>
      </template>

      <template v-if="currentMenu === 'sales'">
        <div><salesManagementView/></div>
      </template>

      <template v-if="currentMenu === 'menu'">
        <div> <OwnerMenu/></div>
        </template>
    </main>
  </div>
</template>

<style scoped>
.owner-layout { display: flex; min-height: 100vh; background-color: #f9f9f9; }
.main-content { flex: 1; padding: 40px; }
.date-container { display: flex; justify-content: flex-end; margin-bottom: 30px; }
.date-text { background-color: #fff; padding: 10px 20px; border-radius: 8px; border: 1px solid #e0e0e0; font-weight: bold; color: #333; }
.summary-container { display: flex; gap: 20px; margin-bottom: 50px; }
.header-title { margin-bottom: 20px; }
.chart-section { background: #fff; padding: 30px; border-radius: 20px; margin-bottom: 40px; }
.ranking-section h3 { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
</style>