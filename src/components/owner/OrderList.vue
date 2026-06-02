<script setup>
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue';
import { useStore } from '@/stores/useStore';
import ownerService from '@/services/ownerService';
import OrderDetailModal from '@/components/owner/OrderDetailModal.vue';

const storeInfo = useStore();
const orders = ref([]);
const modalOpen = ref(false);
const selectedOrder = ref(null);
const eventSource = ref(null);
const newOrderId = ref(null)
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer = null
let highlightTimer = null


// 부모에서 provide한 날짜와 갱신 함수
const selectedDate = inject('selectedDate', ref(null));
const refreshStats = inject('refreshStats', () => {});

const getPayState = order => order.payState ?? order.pay_state ?? order.paymentState ?? order.payment_state

// 결제 완료/환불(payState 2/3) 주문만 사장 주문관리 목록에 노출한다.
const isVisibleOrder = order => {
  const payState = getPayState(order)
  if (payState === undefined || payState === null || payState === '') return false

  return [2, 3].includes(Number(payState))
}

const fetchOrders = async () => {
  if (!storeInfo.myStoreId) return;
  try {
    const response = await ownerService.getOrders(
      storeInfo.myStoreId,
      null,
      selectedDate.value || undefined
    );
    orders.value = (response.resultData ?? []).filter(isVisibleOrder);
  } catch (error) {
    console.error("주문 조회 실패:", error);
  }
};

const showToast = (message) => {
  toastMessage.value = message
  toastVisible.value = true

  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 3000)
}

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

const getStatusInfo = (status, deliveryState) => {
  // state=4는 두 단계(라이더 모집 중 vs 라이더 배정 완료)를 deliveryState로 구분.
  // delivery_state >= 1 (ASSIGNED/AWAITING_PICKUP/...) → 라이더 배정 완료
  if (Number(status) === 4) {
    return Number(deliveryState) >= 1
      ? { text: '배차 완료', class: 'rider' }
      : { text: '배차 신청됨', class: 'rider' };
  }
  const statusInfo = {
    '1': { text: '주문 수락 대기', class: 'waiting' },
    '2': { text: '주문 취소', class: 'cancel' },
    '3': { text: '조리 중', class: 'progress' },
    '5': { text: '배달 중', class: 'shipping' },
    '6': { text: '배달 완료', class: 'completed' },
  };
  return statusInfo[String(status)] || { text: '알 수 없음', class: 'waiting' };
};

watch(
  () => storeInfo.myStoreId,
  () => {
    fetchOrders()
    connectOrderSse()
  }
)

onMounted(() => {
  fetchOrders()
  connectOrderSse()
})

onBeforeUnmount(() => {
  eventSource.value?.close()
  clearTimeout(toastTimer)
  clearTimeout(highlightTimer)
})
const connectOrderSse = () => {
  if (!storeInfo.myStoreId) return

  if (eventSource.value) {
    eventSource.value.close()
  }

  eventSource.value = new EventSource(
    `/api/owner/order/subscribe?storeId=${storeInfo.myStoreId}`,
    { withCredentials: true }
  )

  eventSource.value.addEventListener('connect', (event) => {
    console.log('SSE connected', event.data)
  })

  eventSource.value.addEventListener('new-order', async (event) => {
  const data = JSON.parse(event.data)
  console.log('new order', data)

  newOrderId.value = data.orderId
  const ecoText = data.ecoSelected ? '\n🌿 친환경 선택 (수저 미제공)' : ''
  showToast(`새 주문이 들어왔습니다.${ecoText}`)

  await fetchOrders()
  await refreshStats()

  // 2026-05-25 9건 트랙 정정 — 새 주문 들어오면 OrderDetailModal 자동 popup
  const newOrder = orders.value.find(o => o.orderId === data.orderId)
  if (newOrder) {
    selectedOrder.value = newOrder
    modalOpen.value = true
  }

  clearTimeout(highlightTimer)
  highlightTimer = setTimeout(() => {
    newOrderId.value = null
  }, 3000)
})

  // 2026-05-25 9건 트랙 정정 — 라이더 배차 수락/픽업/배달 완료 시 자동 갱신 + toast 알림
  eventSource.value.addEventListener('order-state-changed', async (event) => {
    const data = JSON.parse(event.data)
    console.log('order state changed', data)
    // 라이더 상태 변경 toast (사장 화면에 라이더 진행 알림)
    const orderStateMsg = {
      4: '라이더가 배차되었습니다.',
      5: '라이더가 픽업했습니다. 배달 중!',
      6: '배달이 완료되었습니다.',
    }
    const msg = orderStateMsg[data.orderState]
    if (msg) showToast(msg)
    await fetchOrders()
    await refreshStats()
  })

  eventSource.value.onerror = (error) => {
    console.error('SSE error:', error)
  }
}

</script>

<template>
  <div class="list-container">
    <div class="title-area">
      <h2 class="main-title">신규 주문</h2>
    </div>

    <Transition name="toast">
      <div v-if="toastVisible" class="order-toast">
        {{ toastMessage }}
      </div>
    </Transition>

    <div class="table-header">
      <span class="col-no">NO.</span>
      <span class="col-time">주문시간</span>
      <span class="col-duration">소요시간</span>
      <span class="col-addr">주소</span>
      <span class="col-menu">메뉴</span>
      <span class="col-eco">친환경</span>
      <span class="col-price">결제금액</span>
      <span class="col-status">상태</span>
    </div>

    <div v-for="(order, index) in orders"
    :key="order.orderId"
    class="order-item"
    :class="{ 'new-order-highlight': order.orderId === newOrderId }"
    @click="openModal(order)">
      <span class="col-no">{{ index + 1 }}</span>
      <span class="col-time">{{ order.orderDate }}</span>
      <span class="col-duration">-</span>
      <span class="col-addr">{{ order.address }}</span>
      <span class="col-menu">{{ order.menuList }}</span>
      <span class="col-eco">
        <span v-if="order.ecoSelected" class="eco-badge">🌿 친환경</span>
      </span>
      <span class="col-price">{{ Number(order.totalPrice).toLocaleString() }}원</span>
      <span class="col-status">
        <button class="status-btn" :class="getStatusInfo(order.state, order.deliveryState).class">
          {{ getStatusInfo(order.state, order.deliveryState).text }}
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
.col-eco { flex: 0.8; display: flex; justify-content: center; align-items: center; }

.eco-badge {
  display: inline-flex;
  align-items: center;
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 11px;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid #a5d6a7;
}

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
.progress  { background-color: #41c045; }
.rider     { background-color: #ffb700; }
.shipping  { background-color: #5024c6; }
.completed { background-color: #1890ff; }
.cancel    { background-color: #c42427; }

.no-data { text-align: center; padding: 50px; color: #aaa; }

.new-order-highlight {
  border-color: #a40c0b;
  background: #fff4f4;
  box-shadow: 0 0 0 2px rgba(164, 12, 11, 0.14);
  animation: highlightPulse 0.8s ease-in-out 2;
}

@keyframes highlightPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.01);
  }
  100% {
    transform: scale(1);
  }
}

.order-toast {
  position: fixed;
  top: 28px;
  right: 28px;
  z-index: 300;
  padding: 14px 18px;
  border-radius: 10px;
  background: #a40c0b;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(164, 12, 11, 0.24);
  white-space: pre-line;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
