<script setup>
import { useDeliveryStore } from '@/stores/deliveryStore'

const deliveryStore = useDeliveryStore()
</script>

<template>
  <div class="inprogress_tab">
    <p v-if="deliveryStore.state.loadingInProgress" class="hint">불러오는 중...</p>
    <p v-else-if="deliveryStore.state.inProgress.length === 0" class="empty">
      진행 중인 배달이 없습니다.
    </p>

    <!-- R6-FE-4에서 단계별 액션 + 모달 + 지도 채움 -->
    <ul v-else class="placeholder_list">
      <li v-for="d in deliveryStore.state.inProgress" :key="d.deliveryNo" class="placeholder_card">
        <p class="status">{{ d.status }}</p>
        <p class="no">{{ d.deliveryNo }}</p>
        <p class="hint_fe4">(R6-FE-4 진행 단계 액션 채움 예정)</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.inprogress_tab { padding: 0 16px; }
.hint, .empty { text-align: center; color: var(--gray); padding: 60px 0; font-size: 14px; }
.placeholder_list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.placeholder_card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
}
.status { font-weight: 700; color: var(--primary); margin-bottom: 4px; }
.no { font-size: 13px; color: var(--gray-dark); }
.hint_fe4 { font-size: 11px; color: var(--gray-light); margin-top: 6px; }
</style>
