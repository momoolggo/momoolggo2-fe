<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import RiderHeader from '@/components/rider/RiderHeader.vue'
import workSessionService from '@/services/workSessionService'

const today = ref(null)
const summary = ref(null)
const loading = ref(true)
let timer = null

const fmtDuration = (seconds) => {
  if (seconds == null) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const fmtTime = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const todayWorkHHMM = computed(() => fmtDuration(today.value?.workSeconds))
const todayBreakHHMM = computed(() => fmtDuration(today.value?.breakSeconds))
const weekWorkHHMM = computed(() => fmtDuration(summary.value?.totalWorkSeconds))

const load = async () => {
  loading.value = true
  try {
    const [t, s] = await Promise.all([
      workSessionService.getToday(),
      workSessionService.getSummary('week'),
    ])
    today.value = t
    summary.value = s
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  // 진행 중 세션이면 1분마다 새로고침 (work_seconds 갱신은 종료 시점 계산이라 표시 차이 크지 않음 — 단순 갱신)
  timer = setInterval(load, 60_000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <RiderHeader />
  <main class="content">
    <section v-if="loading" class="loading">불러오는 중...</section>

    <section v-else class="card">
      <h2 class="card-title">오늘의 운행</h2>
      <div v-if="!today?.sessionNo" class="empty">
        오늘 시작한 근무가 없습니다. 메인 화면에서 <strong>배달중</strong>으로 전환하세요.
      </div>
      <div v-else class="grid">
        <div class="row"><span class="label">시작</span><span class="value">{{ fmtTime(today.startedAt) }}</span></div>
        <div class="row"><span class="label">종료</span><span class="value">{{ fmtTime(today.endedAt) }}</span></div>
        <div class="row"><span class="label">차량</span><span class="value">{{ today.vehicleType }}</span></div>
        <div class="row big"><span class="label">총 배달 시간</span><span class="value">{{ todayWorkHHMM }}</span></div>
        <div class="row big"><span class="label">휴게 시간</span><span class="value">{{ todayBreakHHMM }}</span></div>
      </div>
    </section>

    <section v-if="!loading" class="card">
      <h2 class="card-title">최근 7일 합계</h2>
      <div class="grid">
        <div class="row"><span class="label">세션 수</span><span class="value">{{ summary?.sessionCount ?? 0 }}</span></div>
        <div class="row big"><span class="label">총 운행 시간</span><span class="value">{{ weekWorkHHMM }}</span></div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.content {
  padding: 16px;
  background: #f7f7f7;
  min-height: calc(100vh - 56px);
}
.loading, .empty {
  text-align: center;
  color: #888;
  padding: 24px;
}
.card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.card-title {
  font-size: 16px;
  margin: 0 0 12px;
  font-weight: 600;
}
.grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.row:last-child { border-bottom: 0; }
.row .label { color: #777; font-size: 14px; }
.row .value { font-weight: 500; font-size: 14px; }
.row.big .label { color: #333; font-weight: 500; }
.row.big .value { font-size: 18px; color: #A40C0B; font-weight: 700; }
</style>
