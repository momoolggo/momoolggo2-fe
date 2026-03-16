<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from '@/stores/useStore';
import ownerService from '@/services/ownerService';
import OrderDetailModal from '@/components/owner/OrderDetailModal.vue';

const storeInfo = useStore();
const orders = ref([]);
const modalOpen = ref(false);
const selectedOrder = ref(null);

const fetchOrders = async () => {
  if (!storeInfo.myStoreId) return;
  try {
    const response = await ownerService.getOrders(storeInfo.myStoreId, null);
    orders.value = response.resultData ?? [];
  } catch (error) {
    console.error("주문 조회 실패:", error);
  }
};

const openModal = (order) => {
  selectedOrder.value = order;
  modalOpen.value = true;
};

const getStatusInfo = (status) => {
  const statusInfo = {
    'WAITING':  { text: '주문 수락 대기', class: 'waiting'  },
    'PROGRESS': { text: '주문 진행 중',   class: 'progress' },
    'SHIPPING': { text: '배달 중',        class: 'shipping' },
    'CANCEL':   { text: '주문취소',       class: 'cancel'   }
  };
  return statusInfo[status] || { text: '알 수 없음', class: 'waiting' };
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

    <div v-for="(order, index) in orders" :key="index" class="order-item" @click="openModal(order)">
      <span class="col-no">{{ order.orderId }}</span>
      <span class="col-time">{{ order.orderDate }}</span>
      <span class="col-duration">-</span>
      <span class="col-addr">{{ order.address }}</span>
      <span class="col-menu">{{ order.menuList }}</span>
      <span class="col-price">{{ order.totalPrice }}</span>
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
      @close="modalOpen = false"
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
  width: 110px;
  padding: 7px 0;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
  color: #fff;
}

.waiting  { background-color: #e2e4e8; color: #4f5e7b; }
.progress { background-color: #4caf50; }
.shipping { background-color: #5e2bed; }
.cancel   { background-color: #e63911; }

.no-data { text-align: center; padding: 50px; color: #aaa; }
</style>