<script setup>
import { ref, onMounted, watch } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import adminService from '@/services/adminService'

const dashboard = ref({
  memberCount: 0,
  storeCount: 0,
  reviewCount: 0
})

const chartTab = ref('weekly')
const chartMetric = ref('memberCount')
const dropdownOpen = ref(false)
const chartData = ref([])
const maxBarValue = ref(1)

const metricOptions = [
  { key: 'memberCount', label: '가입자 수' },
  { key: 'storeCount', label: '가게 등록 수' },
  { key: 'reviewCount', label: '리뷰 등록 수' },
]

const fetchChartData = async () => {
  try {
    const res = await adminService.getChartStats(chartTab.value, chartMetric.value)
    chartData.value = res?.resultData ?? []
    maxBarValue.value = Math.max(...chartData.value.map(d => d.value), 1)
  } catch (e) {
    console.error('차트 조회 실패', e)
    chartData.value = []
  }
}

onMounted(async () => {
  try {
    const res = await adminService.getDashboard()
    if (res?.resultData) {
      dashboard.value = {
        memberCount: res.resultData.memberCount ?? 0,
        storeCount: res.resultData.storeCount ?? 0,
        reviewCount: res.resultData.reviewCount ?? 0,
      }
    }
  } catch (e) {
    console.error('대시보드 조회 실패', e)
  }
  await fetchChartData()
})

watch(chartTab, () => fetchChartData())

const selectedMetricLabel = () =>
  metricOptions.find((m) => m.key === chartMetric.value)?.label ?? '가입자 수'

const selectMetric = (key) => {
  chartMetric.value = key
  dropdownOpen.value = false
  fetchChartData()
}

const barHeightPercent = (val) => {
  if (maxBarValue.value === 0) return 0
  return (val / maxBarValue.value) * 100
}
</script>

<template>
  <div class="admin_layout">
    <AdminSidebar />

    <div class="main_content">
      <AdminHeader />

      <div class="content">

        <!-- Today 통계 카드 -->
        <div class="today_section">
          <p class="today_label">Today</p>
          <div class="stats_grid">
            <div class="stat_card">
              <p class="stat_label">가입자 수</p>
              <p class="stat_value">
                {{ dashboard.memberCount }}<span class="stat_unit">명</span>
              </p>
            </div>
            <div class="stat_card">
              <p class="stat_label">가게등록수</p>
              <p class="stat_value">
                {{ dashboard.storeCount }}<span class="stat_unit">개</span>
              </p>
            </div>
            <div class="stat_card">
              <p class="stat_label">리뷰등록수</p>
              <p class="stat_value">
                {{ dashboard.reviewCount }}<span class="stat_unit">개</span>
              </p>
            </div>
          </div>
        </div>

        <!-- 현황 차트 -->
        <div class="chart_section">
          <div class="chart_header">
            <div class="chart_title_row">
              <span class="chart_title">현황 차트</span>
              <div class="tab_group">
                <button class="tab_btn" :class="{ active: chartTab === 'weekly' }" @click="chartTab = 'weekly'">주간</button>
                <button class="tab_btn" :class="{ active: chartTab === 'monthly' }" @click="chartTab = 'yearly'">월간</button>
              </div>
            </div>

            <!-- 드롭다운 -->
            <div class="dropdown_wrap">
              <button class="dropdown_btn" @click="dropdownOpen = !dropdownOpen">
                {{ selectedMetricLabel() }}
                <span class="dropdown_arrow">▼</span>
              </button>
              <div v-if="dropdownOpen" class="dropdown_menu">
                <button
                  v-for="opt in metricOptions"
                  :key="opt.key"
                  class="dropdown_item"
                  @click="selectMetric(opt.key)"
                >{{ opt.label }}</button>
              </div>
            </div>
          </div>

          <!-- 바 차트 -->
          <div class="bar_chart_wrap">
            <div class="bar_chart">
              <div v-for="(item, idx) in chartData" :key="idx" class="bar_col">
                <span class="bar_val">{{ item.value }}</span>
                <div class="bar_wrapper">
                  <div
                    class="bar"
                    :style="{ height: barHeightPercent(item.value) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="bar_bottom_line"></div>
            <div class="bar_labels">
              <span v-for="(item, idx) in chartData" :key="idx" class="bar_label">{{ item.label }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.admin_layout { display: flex; min-height: 100vh; background: #ffffff; font-family: 'Noto Sans KR', sans-serif; }
.main_content { margin-left: 190px; flex: 1; display: flex; flex-direction: column; }
.content { padding: 36px 60px; display: flex; flex-direction: column; gap: 20px; }
.today_section { background: transparent; border-radius: 12px; padding: 24px 28px; }
.today_label { font-size: 20px; font-weight: 700; color: #222; margin-bottom: 16px; }
.stats_grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.stat_card { background: #f5f5f5; border-radius: 10px; padding: 18px 20px; }
.stat_label { font-size: 13px; color: #777; margin-bottom: 8px; font-weight: 500; }
.stat_value { font-size: 30px; font-weight: 800; color: #cc1f1f; line-height: 1; }
.stat_unit { font-size: 15px; font-weight: 600; color: #444; margin-left: 2px; }
.chart_section { background: transparent; border-radius: 12px; padding: 24px 28px; }
.chart_header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.chart_title_row { display: flex; align-items: center; gap: 16px; }
.chart_title { font-size: 20px; font-weight: 700; color: #222; }
.tab_group { display: flex; gap: 4px; }
.tab_btn { background: none; border: none; font-size: 13px; color: #aaa; cursor: pointer; padding: 4px 8px; border-radius: 4px; font-weight: 500; transition: color 0.15s; }
.tab_btn.active { color: #cc1f1f; font-weight: 700; }
.tab_btn:hover:not(.active) { color: #666; }
.dropdown_wrap { position: relative; }
.dropdown_btn { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 6px 12px; font-size: 13px; color: #333; cursor: pointer; display: flex; align-items: center; gap: 8px; min-width: 110px; justify-content: space-between; }
.dropdown_arrow { font-size: 10px; color: #999; }
.dropdown_menu { position: absolute; top: calc(100% + 4px); right: 0; background: #fff; border: 1px solid #ddd; border-radius: 6px; min-width: 130px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 20; overflow: hidden; }
.dropdown_item { display: block; width: 100%; padding: 9px 14px; font-size: 13px; color: #333; background: none; border: none; text-align: left; cursor: pointer; transition: background 0.1s; }
.dropdown_item:hover { background: #f5f5f5; }
.bar_chart_wrap { display: flex; flex-direction: column; }
.bar_chart { display: flex; align-items: flex-end; height: 200px; gap: 0; }
.bar_col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.bar_val { font-size: 12px; color: #888; margin-bottom: 4px; font-weight: 500; }
.bar_wrapper { width: 60%; flex: 1; display: flex; align-items: flex-end; }
.bar { width: 100%; background: #cc1f1f; border-radius: 4px 4px 0 0; transition: height 0.3s ease; min-height: 4px; }
.bar_bottom_line { width: 100%; height: 1px; background: #ccc; margin: 0; }
.bar_labels { display: flex; margin-top: 8px; }
.bar_label { flex: 1; font-size: 11px; color: #888; white-space: nowrap; text-align: center; }
</style>