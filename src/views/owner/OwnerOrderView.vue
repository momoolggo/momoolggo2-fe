<script setup>
import { ref, computed, onMounted, provide, watch } from 'vue';
import Sidebar from '@/components/owner/Sidebar.vue';
import OrderCard from '@/components/owner/OrderCard.vue';
import OrderList from '@/components/owner/OrderList.vue';
import OwnerMenu from '@/components/owner/OwnerMenu.vue';
import salesManagementView from '@/components/owner/SalesManagementView.vue';
import StoreManagementView from '@/components/owner/StoreManagementView.vue';
import AddStoreView from '@/views/owner/AddStoreView.vue';
import ownerService from '@/services/ownerService';
import { useStore } from '@/stores/useStore';
import OwnerReviewView from './OwnerReviewView.vue'

const storeInfo = useStore();

// 날짜 선택 (기본값: 오늘)
const selectedDate = ref(new Date().toISOString().slice(0, 10));

const stats = ref({
  total: 0,
  waiting: 0,
  completed: 0,
  cancel: 0
});

const fetchStats = async () => {
  if (!storeInfo.myStoreId) return;
  try {
    const response = await ownerService.getOrders(
      storeInfo.myStoreId,
      null,
      selectedDate.value
    );
    const orders = response?.resultData ?? [];

      stats.value = {
        total: orders.length,
        waiting: orders.filter(o => Number(o.state) === 1).length,
        completed: orders.filter(o => Number(o.state) === 6).length,
        cancel: orders.filter(o => Number(o.state) === 2).length
      };
  } catch (error) {
    console.error("통계 조회 실패:", error);
  }
};

// 날짜 변경 시 통계 갱신
const onDateChange = () => {
  fetchStats();
};

// 가게 전환 시 자동 갱신
watch(() => storeInfo.myStoreId, () => {
  fetchStats();
});

// 자식 컴포넌트(OrderList)에서 사용
provide('selectedDate', selectedDate);
provide('refreshStats', fetchStats);

onMounted(fetchStats);

const currentMenu = ref('order');

const formattedDate = computed(() => {
  const d = new Date(selectedDate.value + 'T00:00:00');
  return `${d.getFullYear()} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${String(d.getDate()).padStart(2, '0')}`;
});
</script>

<template>
  <div class="owner-layout">
    <Sidebar :activeMenu="currentMenu" @menu-change="menu => currentMenu = menu" />
    <main class="main-content">
      <!--주문관리 화면-->
      <template v-if="currentMenu === 'order'">
        <div class="date-container">
          <div class="date-picker-wrapper" @click="$refs.datePicker.showPicker()">
           <span class="date-display">📅 {{ formattedDate }}</span>
    <input
      type="date"
      v-model="selectedDate"
      @change="onDateChange"
      class="date-input"
      ref="datePicker"
    />
  </div>
</div>

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

      <!-- 가게관리 화면 -->
      <template v-if="currentMenu === 'store'">
        <StoreManagementView />
      </template>
      
      <!-- 리뷰관리 화면 -->
      <template v-if="currentMenu === 'review'">
        <OwnerReviewView />
      </template>

    </main>
  </div>
</template>

<style scoped>
.owner-layout { display: flex; min-height: 100vh; background-color: #f9f9f9; }
.main-content { flex: 1; padding: 40px; }
.date-container { display: flex; justify-content: flex-end; margin-bottom: 30px; }

.date-picker-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: border-color 0.2s;
}

.date-picker-wrapper:hover {
  border-color: #2ac1bc;
}

.date-display {
  font-weight: bold;
  color: #333;
  font-size: 15px;
  pointer-events: none;
}

.date-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.summary-container { display: flex; gap: 20px; margin-bottom: 50px; }
.header-title { margin-bottom: 20px; }
.chart-section { background: #fff; padding: 30px; border-radius: 20px; margin-bottom: 40px; }
.ranking-section h3 { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
</style>