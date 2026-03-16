<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/owner/Sidebar.vue';
import OrderCard from '@/components/owner/OrderCard.vue';
import OrderList from '@/components/owner/OrderList.vue';
import OwnerMenu from '@/components/owner/OwnerMenu.vue';
import salesManagementView from '@/components/owner/SalesManagementView.vue';
import AddStoreView from '@/views/owner/AddStoreView.vue';
import ownerService from '@/services/ownerService';
import { useStore } from '@/stores/useStore';

const storeInfo = useStore();

const stats = ref({
  total: 0,
  waiting: 0,
  completed: 0,
  cancel: 0
});

const fetchState = async () => {
  if (!storeInfo.myStoreId) return;
  try {
    const response = await ownerService.getOrders(storeInfo.myStoreId, null);
    if (response?.resultData) {
      stats.value = response.resultData;
    }
  } catch (error) {
    console.error("통계 조회 실패:", error);
  }
};

onMounted(fetchState);

const currentMenu = ref('order');

const formattedDate = computed(() => {
  const now = new Date();
  return `${now.getFullYear()} / ${String(now.getMonth() + 1).padStart(2, '0')} / ${String(now.getDate()).padStart(2, '0')}`;
});
</script>

<template>
  <div class="owner-layout">
    <Sidebar :activeMenu="currentMenu" @menu-change="menu => currentMenu = menu" />
    <main class="main-content">
      <!--주문관리 화면-->
      <template v-if="currentMenu === 'order'">
        <div class="date-container"><span class="date-text">📅 {{ formattedDate }}</span></div>

        <section class="summary-container">
          <OrderCard title="총 주문수"     :count="stats.total"     />
          <OrderCard title="주문수락대기"  :count="stats.waiting"   />
          <OrderCard title="배달 완료"     :count="stats.completed" />
          <OrderCard title="취소건수"      :count="stats.cancel"    type="cancel" />
        </section>

        <section class="order-list-section"><OrderList /></section>
      </template>

      <!-- 매출관리 화면 -->
      <template v-if="currentMenu === 'sales'">
        <div><salesManagementView /></div>
      </template>

      <!-- 메뉴관리 화면 -->
      <template v-if="currentMenu === 'menu'">
        <div><OwnerMenu /></div>
      </template>

      <!-- 입점신청 (가게 없을 때) -->
      <template v-if="currentMenu === 'addstore'">
        <AddStoreView />
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