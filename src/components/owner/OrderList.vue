<script setup>
import { ref, onMounted, inject, watch } from 'vue';
import { useStore } from '@/stores/useStore';
import ownerService from '@/services/ownerService';
import OrderDetailModal from '@/components/owner/OrderDetailModal.vue';

const storeInfo = useStore();
const orders = ref([]);
const modalOpen = ref(false);
const selectedOrder = ref(null);

// 부모에서 provide한 날짜와 갱신 함수
const selectedDate = inject('selectedDate', ref(null));
const refreshStats = inject('refreshStats', () => {});

const fetchOrders = async () => {
  if (!storeInfo.myStoreId) return;
  try {
    const response = await ownerService.getOrders(
      storeInfo.myStoreId,
      null,
      selectedDate.value || undefined
    );
    orders.value = response.resultData ?? [];
  } catch (error) {
    console.error("주문 조회 실패:", error);
  }
};

// 날짜가 변경되면 주문 목록도 갱신
watch(selectedDate, () => {
  fetchOrders();
});

const openModal = (order) => {
  selectedOrder.value = order;
  modalOpen.value = true;
};

// 모달 닫힐 때 목록 + 통계 모두 갱신
const onModalClose = () => {
  modalOpen.value = false;
  fetchOrders();
  refreshStats();
};

const getStatusInfo = (status) => {
  const statusInfo = {
    '0': { text: '주문 수락 대기', class: 'waiting' },
    '1': { text: '주문 진행 중', class: 'progress' },
    '2': { text: '라이더배차 진행중', class: 'rider' },
    '3': { text: '배달 중', class: 'shipping' },
    '4': { text: '배달 완료', class: 'completed' },
    '5': { text: '주문취소', class: 'cancel' }
  };
  return statusInfo[String(status)] || { text: '알 수 없음', class: 'waiting' };
};

onMounted(fetchOrders);
</script>

<template>
  <div class="list-container">
    <div class="title-area">
      <h2 class="main-title">신규 주문</h2>
    </div>

    <div class="table-header">
      <span class="col-no">NO.</span>
      <span class="col-time">주문시간</span>
      <span class="col-duration">소요시간</span>
      <span class="col-addr">주소</span>
      <span class="col-menu">메뉴</span>
      <span class="col-price">결제금액</span>
      <span class="col-status">상태</span>
    </div>

    <div v-for="order in orders" :key="order.orderId" class="order-item" @click="openModal(order)">
      <span class="col-no">{{ index + 1 }}</span>
      <span class="col-time">{{ order.orderDate }}</span>
      <span class="col-duration">-</span>
      <span class="col-addr">{{ order.address }}</span>
      <span class="col-menu">{{ order.menuList }}</span>
      <span class="col-price">{{ Number(order.totalPrice).toLocaleString() }}원</span>
      <span class="col-status">
        <button class="status-btn" :class="getStatusInfo(order.state).class">
          {{ getStatusInfo(order.state).text }}
        </button>
      </span>
    </div>

    <div v-if="orders.length === 0" class="no-data">
      현재 들어온 신규 주문이 없습니다.
    </div>

    <OrderDetailModal
      v-if="modalOpen"
      :order="selectedOrder"
      @close="onModalClose"
    />
  </div>
</template>

<style scoped>
.title-area {
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  padding: 18px 0;
  margin-bottom: 25px;
  text-align: center;
}
.main-title { font-size: 20px; font-weight: bold; color: #333; margin: 0; }

.table-header, .order-item {
  display: flex;
  align-items: center;
  padding: 12px 25px;
  text-align: center;
}

.table-header {
  color: #999;
  font-size: 15px;
  font-weight: bold;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.order-item {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  cursor: pointer;
}

.col-no { flex: 0.6; }
.col-time { flex: 1; }
.col-duration { flex: 0.8; }
.col-addr { flex: 3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-menu { flex: 2.2; }
.col-price { flex: 1.2; }
.col-status { flex: 1.5; display: flex; justify-content: center; }

.status-btn {
  width: 130px;
  padding: 7px 0;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
  color: #fff;
}

.waiting   { background-color: #e2e4e8; color: #4f5e7b; }
.progress  { background-color: #4caf50; }
.rider     { background-color: #ff9800; }
.shipping  { background-color: #5e2bed; }
.completed { background-color: #2ac1bc; }
.cancel    { background-color: #e63911; }

.no-data { text-align: center; padding: 50px; color: #aaa; }
</style>