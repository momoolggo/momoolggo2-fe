<script setup>
const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('data:')) return path      // ← Base64 data URI 지원 추가
  if (path.startsWith('http') || path.startsWith('blob')) return path
  return `http://localhost:8080${path}`
}

defineProps({
  menu: {
    type: Object,
    required: true,
  },
})

defineEmits(['click-menu'])
</script>

<template>
  <div class="menu-item-card" @click="$emit('click-menu', menu)">
    <div class="menu-info">
      <h3 class="menu-name">{{ menu.menuName }}</h3>
      <p class="menu-desc">{{ menu.menuInfo }}</p>
      <div class="menu-price-row">
        <span class="menu-price">{{ menu.price?.toLocaleString() }}원</span>
        <span v-if="menu.soldout === 1" class="soldout-badge">품절</span>
      </div>
    </div>

    <div class="menu-img-wrapper" v-if="menu.menuPic">
      <img :src="getImageUrl(menu.menuPic)" class="menu-img" alt="메뉴 이미지" />
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
  align-items: center;
  padding: 20px;
  margin: 10px 20px;
  background-color: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
}
.menu-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}
.menu-info { flex: 1; padding-right: 15px; }
.menu-name { margin: 0 0 6px 0; font-size: 1.15rem; font-weight: 700; color: #222; }
.menu-desc { font-size: 0.88rem; color: #888; line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.menu-price { font-size: 1.05rem; font-weight: 700; color: #333; }
.soldout-badge { margin-left: 10px; font-size: 0.75rem; color: #ff4d4f; border: 1px solid #ff4d4f; padding: 2px 6px; border-radius: 4px; }
.menu-img-wrapper { flex-shrink: 0; }
.menu-img { width: 100px; height: 100px; border-radius: 8px; object-fit: cover; }
.menu-img-placeholder { width: 100px; height: 100px; background-color: #f5f5f5; color: #ccc; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 0.8rem; }
</style>