<script setup>
// R9 배달내역 — orderHistoryService.getCompleted 재사용 (기본 최근 30일).
// RiderHistoryView 패턴 일관 (services 동일, 표시 형태만 탭용 요약).
// 2026-05-19: placeholder "R7/R8 진입 시 채움" → 실제 데이터 채움.
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import orderHistoryService from '@/services/orderHistoryService'

const router = useRouter()

const history = ref(null)
const loading = ref(true)

const rows = computed(() => history.value?.rows ?? [])
const recentRows = computed(() => rows.value.slice(0, 10))
const hasMore = computed(() => rows.value.length > 10)

const fmtMoney = (n) => (n ?? 0).toLocaleString('ko-KR') + '원'
const fmtTime = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const load = async () => {
  loading.value = true
  try {
    history.value = await orderHistoryService.getCompleted()
  } finally {
    loading.value = false
  }
}

const goHistory = () => router.push('/rider/history')

onMounted(load)
</script>

<template>
  <div class="completed_tab">
    <p v-if="loading" class="state">불러오는 중...</p>

    <template v-else-if="history">
      <section class="summary">
        <div class="sum-item">
          <span class="sum-label">최근 30일 건수</span>
          <span class="sum-value">{{ history.totalCount ?? 0 }}건</span>
        </div>
        <div class="sum-item primary">
          <span class="sum-label">총 배달비</span>
          <span class="sum-value">{{ fmtMoney(history.totalFee) }}</span>
        </div>
      </section>

      <p v-if="rows.length === 0" class="state">최근 30일 완료된 배달이 없습니다.</p>

      <ul v-else class="list">
        <li v-for="r in recentRows" :key="r.deliveryNo" class="item">
          <header class="head">
            <span class="time">{{ fmtTime(r.deliveredAt) }}</span>
            <span class="fee">{{ fmtMoney(r.totalFee) }}</span>
          </header>
          <div class="row"><span class="label">픽업</span><span class="value">{{ r.pickupAddress ?? '-' }}</span></div>
          <div class="row"><span class="label">배달</span><span class="value">{{ r.deliveryAddress ?? '-' }}</span></div>
        </li>
      </ul>

      <button v-if="hasMore" class="more_btn" @click="goHistory">전체 배달내역 보기</button>
    </template>
  </div>
</template>

<style scoped>
.completed_tab { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 12px; }
.state { text-align: center; color: var(--gray); padding: 40px 0; font-size: 14px; }

.summary {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.sum-item {
  flex: 1;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sum-item.primary { background: var(--primary); color: var(--white); border-color: var(--primary); }
.sum-label { font-size: 12px; opacity: 0.85; }
.sum-value { font-size: 18px; font-weight: 700; }

.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.item {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
}
.head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.time { font-size: 13px; color: var(--gray-dark); }
.fee { font-size: 14px; font-weight: 700; color: var(--primary); }
.row {
  display: flex;
  gap: 8px;
  font-size: 13px;
  padding: 2px 0;
}
.row .label {
  color: var(--gray);
  width: 32px;
  flex-shrink: 0;
}
.row .value { color: var(--black); }

.more_btn {
  margin-top: 4px;
  padding: 10px;
  background: var(--white);
  color: var(--primary);
  border: 1.5px solid var(--primary);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.more_btn:hover { background: var(--primary-light); }
</style>
