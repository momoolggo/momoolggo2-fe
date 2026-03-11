<script setup>
// 부모로부터 메뉴 정보를 전달받음
defineProps({
  menu: {
    type: Object,
    required: true,
  },
})

// 메뉴 클릭 시 장바구니 팝업 등을 띄우기 위한 이벤트
defineEmits(['click-menu'])
</script>
<template>
  <div class="menu-item-card" @click="$emit('click-menu', menu)">
    <div class="menu-info">
      <h3 class="menu-name">{{ menu.name }}</h3>
      <p class="menu-desc">{{ menu.desc }}</p>
      <div class="menu-price-row">
        <span class="menu-price">{{ menu.price.toLocaleString() }}원</span>
      </div>
    </div>

    <div class="menu-img-wrapper" v-if="menu.pic">
      <img :src="menu.pic" class="menu-img" alt="메뉴 이미지" />
    </div>
    <div class="menu-img-wrapper" v-else>
      <div class="menu-img-placeholder">No Image</div>
    </div>
  </div>
</template>

<style scoped>
.menu-item-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  margin-bottom: 12px;
  background-color: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.menu-item-card:active {
  transform: scale(0.98); /* 클릭 시 살짝 눌리는 효과 */
}

.menu-info {
  flex: 1;
  padding-right: 20px;
}

.menu-name {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #222;
}

.menu-desc {
  font-size: 0.9rem;
  color: #888;
  line-height: 1.5;
  margin-bottom: 16px;
  /* 설명이 너무 길면 2줄까지만 노출 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.menu-price {
  font-size: 1.15rem;
  font-weight: 700;
  color: #333;
}

.menu-img-wrapper {
  flex-shrink: 0;
}

.menu-img {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
}

.menu-img-placeholder {
  width: 120px;
  height: 120px;
  background-color: #f8f8f8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 0.8rem;
}
</style>
