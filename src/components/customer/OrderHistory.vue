<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter();

const props = defineProps({
  date: String,
  storeName: String,
  storeImage: String,
  items: Array,       // order_detail 행들 → [{ name, count, price }]
  totalPrice: Number,
  orderState: Number,
  orderId: Number,
  hasReview: Number, // 리뷰 작성 여부 (0: 작성 가능, 1: 작성 완료)
})

// order_state 2 = 주문취소
const isCancelled = computed(() => props.orderState === 2)
const emit = defineEmits(['goToDetail'])

const goToHistory = () => {
  emit('goToDetail', props.orderId)
}

const goToPost = () => {
  router.push(`/mypage/review/${props.orderId}`)
}
</script>


<template>
  <div class="order-item-card">
    <div class="card-header">
      <div class="status-group">
        <span class="status-label">주문 내역</span>
        <span v-if="isCancelled" class="cancel-text">주문취소</span>
      </div>
      <span class="order-date">{{ date }}</span>
    </div>

    <div class="store-info">
      <div class="store-profile">
        <img :src="storeImage" alt="store" class="store-img" />
        <div class="store-name-row">
          <h3 class="store-name">{{ storeName }}</h3>
        </div>
      </div>
      <div class="button-group">
          <!-- 배달완료(6) + 리뷰 없을 때만 리뷰 등록 -->
          <button v-if="orderState === 6 && !hasReview" class="btn-outline" @click="goToPost()">리뷰 등록</button>
          <!-- 배달완료 + 리뷰 이미 있으면 -->
          <button v-else-if="orderState === 6 && hasReview" class="btn-outline btn-done" disabled>리뷰 작성완료</button>
          <!-- 주문 취소면 재주문 -->
          <button v-else-if="isCancelled" class="btn-outline">재주문</button>
        <button class="btn-primary" @click="goToHistory">상세정보</button>
      </div>
    </div>

    <div class="menu-list">
      <div v-for="(item, idx) in items" :key="idx" class="menu-row">
        <span class="menu-name">{{ item.name }}</span>
        <span class="menu-count">{{ item.count }}개</span>
        <span class="menu-price">{{ item.price.toLocaleString() }}원</span>
      </div>
      <div class="menu-row delivery-row">
        <span class="menu-name">배달팁</span>
        <span></span>
        <span class="menu-price">1,500원</span>
      </div>
    </div>

    <div class="total-section">
      <span class="total-label">총 결제 금액</span>
      <div class="total-price-group">
        <span class="total-price">{{ totalPrice.toLocaleString() }}원</span>
        <span v-if="isCancelled" class="cancel-badge">취소</span>
      </div>
    </div>
  </div>
</template>


<style scoped>
.menu-row {
  display: grid;
  /* 이름(남는공간) / 수량(고정 50px) / 가격(고정 85px) */
  grid-template-columns: 1fr 50px 85px;
  align-items: center;
  font-size: 14px;
  color: #555;
  margin-bottom: 6px;
  gap: 4px;
}

.menu-name {
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 이름 너무 길면 ... 처리 */
  min-width: 0;
}

.menu-count {
  color: #bbb;
  text-align: center; /* 수량을 가운데로 정렬해 세로줄 맞춤 */
}

.menu-price {
  text-align: right;
  white-space: nowrap;
}

/* 기존 카드 스타일 유지 */
.order-item-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 24px;
  padding: 16px;
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.status-label {
  color: #3b82f6;
  font-weight: bold;
  font-size: 14px;
}
.cancel-text {
  color: #ef4444;
  font-weight: bold;
  font-size: 14px;
  margin-left: 8px;
}
.order-date {
  color: #999;
  font-size: 13px;
}
.store-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.store-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}
.store-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #eee;
}
.store-name {
  font-size: 18px;
  font-weight: 800;
}
.button-group {
  display: flex;
  gap: 4px;
}
.btn-outline {
  border: 1px solid #3b82f6;
  color: #3b82f6;
  background: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
}
.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
}
.menu-list {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
  margin-bottom: 12px;
}
.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.total-label {
  font-weight: bold;
  color: #333;
}
.total-price {
  font-weight: bold;
  font-size: 16px;
}
.cancel-badge {
  color: #ef4444;
  font-size: 12px;
  margin-left: 4px;
}
.btn-done {
  border-color: #ccc;
  color: #ccc;
  cursor: default;
}
</style>
