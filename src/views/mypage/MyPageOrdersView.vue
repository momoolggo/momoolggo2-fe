<script setup>
import { onMounted, ref, computed } from 'vue'
import OrderItem from '@/components/customer/OrderHistory.vue'
import router from '@/router'
import { useUserStore } from '@/stores/userStore';
import orderService from '@/services/orderService';

const userStore = useUserStore();
const userId = userStore.state.userNo;

// --- 페이징 상태 관리 ---
const orders = ref([])          // 화면에 표시될 주문 목록
const currentPage = ref(1);      // 현재 페이지
const pageSize = 5;         // 한 페이지당 아이템 수
const totalPages = ref(5);       // 전체 페이지 수 (백엔드에서 받아와야 함)
onMounted(async () => {
  try {
    const result = await orderService.getMaxHistory(userId);
    if (result.resultData) {
      totalPages.value = Math.ceil(result.resultData / pageSize);
    }
  }
  catch (error) {
    console.error("총 페이지 수 로드 실패:", error);
  }
})
// 데이터 로드 함수
const loadOrders = async (page) => {
  currentPage.value = page;
  const params = {
    userId: userId,
    currentPage: currentPage.value,
    size: pageSize,
  };
  try {
    const result = await orderService.getOrderHistory(params);
    orders.value = result || [];

    // 페이지 변경 시 상단으로 스크롤 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error("주문 내역 로드 실패:", error);
  }
}

// 페이지네이션 그룹 계산 (현재 페이지 기준 앞뒤로 버튼 생성)
const pageNumbers = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i);
  }
  return pages;
});

onMounted(() => {
  loadOrders(1); // 첫 페이지 로드
})

const goToDetail = (id) => {
  router.push(`/mypage/orders/${id}`)
}
</script>

<template>
  <div class="order-list-page-container">
    <h2 class="page-title">주문 내역</h2>

    <main class="order-list-content">
      <OrderItem
        v-for="(order, index) in orders"
        :key="order.orderId || index"
        v-bind="order"
        @go-to-detail="goToDetail"
      />

      <div class="pagination-container">
        <button
          class="page-btn prev"
          :disabled="currentPage === 1"
          @click="loadOrders(currentPage - 1)"
        >
          &lt;
        </button>

        <button
          v-for="pageNum in pageNumbers"
          :key="pageNum"
          class="page-btn num"
          :class="{ active: currentPage === pageNum }"
          @click="loadOrders(pageNum)"
        >
          {{ pageNum }}
        </button>

        <button
          class="page-btn next"
          :disabled="currentPage === totalPages"
          @click="loadOrders(currentPage + 1)"
        >
          &gt;
        </button>
      </div>

      <button class="btn-continue-order active:bg-blue-600 active:scale-[0.98]" @click="router.push('/storelist')">
        주문 계속하기
      </button>
    </main>
  </div>
</template>

<style scoped>
.order-list-page-container {
  max-width: 480px;
  margin: 0 auto;
  background-color: #fffffffb;
  min-height: 100vh;
  position: relative;
  font-family: 'Pretendard', sans-serif;
}

.page-title {
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  padding: 20px 0;
  color: #333;
}

.order-list-content {
  padding: 0 16px 100px;
}

/* 페이지네이션 스타일 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 30px 0;
}

.page-btn {
  border: 1px solid #ddd;
  background: white;
  color: #666;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
}

.page-btn.active {
  background-color: #B21F1F;
  color: white;
  border-color:#B21F1F;
  font-weight: bold;
}

.page-btn:disabled {
  background-color: #eee;
  color: #ccc;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background-color: #ffffff;
  border-color:#B21F1F;
  color:#B21F1F;
}

.btn-continue-order {
  width: 100%;
  background-color:#B21F1F;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 15px;
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
  cursor: pointer;
}
</style>
