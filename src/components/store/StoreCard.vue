<script setup>
defineProps({
  store: {
    type: Object,
    required: true,
  },
})
defineEmits(['click'])
</script>

<template>
  <div class="store-card" @click="$emit('click', store.id)">
    <img
      :src="store.pic || '/images/default-store.png'"
      class="store-thumbnail"
      alt="가게 이미지"
    />

    <div class="store-details">
      <h3 class="store-name">{{ store.name }}</h3>

      <div class="store-meta">
        <span class="rating">⭐ {{ store.avg }}</span>
        <span class="divider">|</span>
        <span class="review">리뷰 {{ store.sum }}</span>
        <span class="divider">|</span>
        <span class="order"
          >주문 <span class="highlight">{{ store.count }}</span></span>
      </div>

      <div class="delivery-info">
        <span class="tip-badge">✅ 배달팁 무료</span>
        <!--배달팁 추후에 데이터 가져올거임-->
        <span class="divider">|</span>
        <span class="min-order">{{ (store.min || 0).toLocaleString() }}원 이상 배달</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.store-card {
  display: flex;
  padding: 20px;
  margin: 12px 16px;
  gap: 16px;
  background-color: white;
  border-radius: 12px;
  /* 이미지처럼 부드러운 그림자 효과 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.store-card:hover {
  transform: translateY(-2px);
}

.store-thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
}

.store-details {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.store-name {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #111;
}

.store-meta {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.rating {
  color: #ffb800; /* 별색깔 노란색 */
  font-weight: bold;
}

.highlight {
  color: #ff3d00; /* 주문 횟수 강조색 */
  font-weight: 600;
}

.delivery-info {
  font-size: 0.9rem;
  color: #888;
  display: flex;
  align-items: center;
}

.tip-badge {
  color: #2ac1bc; /* 배민 민트색 포인트 */
  font-weight: 600;
}

.divider {
  margin: 0 8px;
  color: #eee;
  font-size: 0.8rem;
}

</style>
