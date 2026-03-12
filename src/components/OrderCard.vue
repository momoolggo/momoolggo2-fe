<script setup>
defineProps({
  title: { type: String, required: true },
  count: { type: [Number, String], default: 0 },
  type: { type: String, default: 'default' } // 부모 컴포넌트에서 넘겨준 속성명(type)과 일치시킴
});
</script>

<template>
  <div class="stat-card" :class="{ 'card-cancel': type === 'cancel' }">
    <h3>{{ title }}</h3>
    <p>{{ count }} 건</p>
  </div>
</template>

<style scoped>
.stat-card {
  flex: 1;
  padding: 25px;
  background: #f0f4ff; /* 기본 배경 */
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-card h3 { color: #555; margin: 0 0 10px 0; font-size: 16px; }
.stat-card p { font-size: 24px; font-weight: bold; color: #333; margin: 0; }

.card-cancel {
  background-color: #fff0f0; /* 연한 핑크 배경 */
  
}
.card-cancel p {
  color: #d32f2f; /* 숫자 색상 */
}
</style>