<script setup>
import { computed } from 'vue';
import OrderCard from '@/components/OrderCard.vue';
import OrderList from '@/components/OrderList.vue';
import Sidebar from '@/components/Sidebar.vue';

// 1. 현재 날짜를 "YYYY / MM / DD" 형식으로 생성하는 계산 속성
const formattedDate = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year} / ${month} / ${day}`;
});
</script>

<template>
  <div class="owner-layout">
    <Sidebar />

    <main class="main-content">
      <div class="date-container">
        <span class="date-text">📅 {{ formattedDate }}</span>
      </div>

      <section class="summary-container">
        <OrderCard title="총 주문수" count="43" />
        <OrderCard title="주문수락대기" count="5" />
        <OrderCard title="배달 완료" count="35" />
        <OrderCard title="취소건수" count="3" type="cancel" />
      </section>

      <section class="order-list-section">
       
        <OrderList />
      </section>
    </main>
  </div>
</template>

<style scoped>
.owner-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f9f9f9;
}

.main-content {
  flex: 1;
  padding: 40px;
}


.date-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
}

.date-text {
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-weight: bold;
  color: #333;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.summary-container {
  display: flex;
  gap: 20px;
  margin-bottom: 50px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}
</style>