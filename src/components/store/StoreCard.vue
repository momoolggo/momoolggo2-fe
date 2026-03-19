<script setup>
defineProps({
  store: {
    type: Object,
    required: true,
  },
})
defineEmits(['click'])

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('data:')) return path      // ← Base64 data URI 지원 추가
  if (path.startsWith('http') || path.startsWith('blob')) return path
  return `http://localhost:8080${path}`
}
</script>

<template>
  <div class="store-card" :class="{ 'is_closed': store.state === 0 }"@click="$emit('click', store)">
    <div v-if="store.state === 0" class="closed-overlay">
      <span class="closed-badge"> 준비중이예요🤗</span>
    </div>
    <img
      :src="getImageUrl(store.pic) || '/images/default-store.png'"
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
        <span class="order">주문 <span class="highlight">{{ store.count }}</span></span>
      </div>

      <div class="delivery-info">
        <span class="tip-badge">✔ 배달팁 무료</span>
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
}
.is-closed {
  cursor: not-allowed;
  filter: grayscale(80%);
  opacity: 0.7;
}

.closed-overlay {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center
}

.closed-badge {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: 20px;
  padding: 4px 12px;
  color: #383434;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.store-card:hover { transform: translateY(-2px); }
.store-thumbnail { width: 100px; height: 100px; border-radius: 12px; object-fit: cover; }
.store-details { display: flex; flex-direction: column; justify-content: flex-start; }
.store-name { margin: 0 0 8px 0; font-size: 1.2rem; font-weight: 700; color: #111; }
.store-meta { font-size: 0.95rem; color: #666; margin-bottom: 8px; display: flex; align-items: center; }
.rating { color: #ffb800; font-weight: bold; }
.highlight { color: #ff3d00; font-weight: 600; }
.delivery-info { font-size: 0.9rem; color: #888; display: flex; align-items: center; }
.tip-badge { color: #169750; font-weight: 600; }
.divider { margin: 0 8px; color: #eee; font-size: 0.8rem; }
</style>