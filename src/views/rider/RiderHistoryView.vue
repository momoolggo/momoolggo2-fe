<script setup>
import { onMounted, ref, computed } from 'vue'
import RiderHeader from '@/components/rider/RiderHeader.vue'
import orderHistoryService from '@/services/orderHistoryService'

const history = ref(null)
const loading = ref(true)

const toISO = (d) => d.toISOString().slice(0, 10)
const today = new Date()
const defaultFrom = new Date(today)
defaultFrom.setDate(today.getDate() - 30)

const from = ref(toISO(defaultFrom))
const to = ref(toISO(today))

const fmtMoney = (n) => (n ?? 0).toLocaleString('ko-KR') + '원'
const fmtTime = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const load = async () => {
  loading.value = true
  try {
    history.value = await orderHistoryService.getCompleted(from.value, to.value)
  } finally {
    loading.value = false
  }
}

const apply = () => { load() }

onMounted(load)

const rows = computed(() => history.value?.rows ?? [])
</script>

<template>
  <RiderHeader />
  <main class="content">
    <section class="filter">
      <input type="date" v-model="from" />
      <span class="sep">~</span>
      <input type="date" v-model="to" />
      <button class="apply" @click="apply">조회</button>
    </section>

    <section v-if="!loading && history" class="summary">
      <div class="sum-item">
        <span class="sum-label">총 건수</span>
        <span class="sum-value">{{ history.totalCount }}건</span>
      </div>
      <div class="sum-item primary">
        <span class="sum-label">총 배달비</span>
        <span class="sum-value">{{ fmtMoney(history.totalFee) }}</span>
      </div>
    </section>

    <section v-if="loading" class="state">불러오는 중...</section>
    <section v-else-if="rows.length === 0" class="state">선택한 기간에 완료된 배달이 없습니다.</section>

    <ul v-else class="list">
      <li v-for="r in rows" :key="r.deliveryNo" class="item">
        <header class="head">
          <span class="time">{{ fmtTime(r.deliveredAt) }}</span>
          <span class="fee">{{ fmtMoney(r.totalFee) }}</span>
        </header>
        <div class="row"><span class="label">픽업</span><span class="value">{{ r.pickupAddress }}</span></div>
        <div class="row"><span class="label">배달</span><span class="value">{{ r.deliveryAddress }}</span></div>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.content {
  padding: 0;
  background: #f7f7f7;
  min-height: calc(100vh - 56px);
}
.filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 56px;
  z-index: 10;
}
.filter input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
}
.sep { color: #aaa; }
.apply {
  margin-left: auto;
  padding: 6px 14px;
  border: 0;
  background: #A40C0B;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.summary {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
}
.sum-item {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sum-item.primary { background: #A40C0B; color: white; }
.sum-label { font-size: 12px; opacity: 0.8; }
.sum-value { font-size: 18px; font-weight: 700; }
.state {
  padding: 40px 20px;
  text-align: center;
  color: #888;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item {
  background: white;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.time { font-size: 13px; color: #555; }
.fee { font-size: 14px; font-weight: 600; color: #A40C0B; }
.row {
  display: flex;
  gap: 8px;
  font-size: 13px;
  padding: 2px 0;
}
.row .label {
  color: #888;
  width: 32px;
  flex-shrink: 0;
}
.row .value { color: #333; }
</style>
