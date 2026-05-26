<script setup>
import { ref, onMounted, watch } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import adminService from '@/services/adminService'
import VueApexCharts from 'vue3-apexcharts'

const dashboard = ref({
  memberCount: 0,
  storeCount: 0,
  reviewCount: 0
})

const chartTab = ref(null)
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
  await fetchCategoryStats()
  await fetchOrderTrend()
})

const selectTab = (tab) => {
  chartTab.value = tab
  fetchChartData()
}

watch(chartTab, (val) => { if (val) fetchChartData() })

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

// 주문 추이 라인 차트
const trendPeriod = ref('daily')
const trendSeries = ref([{ name: '주문 수', data: [] }])
const trendOptions = ref({
  chart: { type: 'line', toolbar: { show: false } },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#cc1f1f'],
  xaxis: { categories: [] },
  yaxis: { labels: { formatter: (v) => Math.floor(v) } },
  tooltip: { y: { formatter: (v) => v + '건' } },
  grid: { borderColor: '#f0f0f0' },
  markers: { size: 4 },
})

const fetchOrderTrend = async () => {
  try {
    const res = await adminService.getOrderTrend(trendPeriod.value)
    const data = res?.resultData ?? []
    trendOptions.value = { ...trendOptions.value, xaxis: { categories: data.map(d => d.label) } }
    trendSeries.value = [{ name: '주문 수', data: data.map(d => Number(d.value)) }]
  } catch (e) {
    console.error('주문 추이 조회 실패', e)
  }
}

// 카테고리별 주문 비율 도넛 차트
const donutSeries = ref([])
const donutLabels = ref([])
const donutOptions = ref({
  chart: { type: 'donut' },
  labels: [],
  colors: ['#cc1f1f', '#f4826a', '#f4b56a', '#f4e06a', '#a8d8a8', '#6ab4f4', '#b46af4', '#f46ab4'],
  legend: { position: 'bottom', fontSize: '13px', fontFamily: 'Noto Sans KR, sans-serif' },
  dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + '%' },
  plotOptions: { pie: { donut: { size: '60%' } } },
  tooltip: { y: { formatter: (val) => val + '건' } },
})

const fetchCategoryStats = async () => {
  try {
    const res = await adminService.getCategoryOrderStats()
    console.log('카테고리 통계 응답:', res)
    const data = res?.resultData ?? []
    donutLabels.value = data.map(d => d.categoryName)
    donutSeries.value = data.map(d => Number(d.count))
    donutOptions.value = { ...donutOptions.value, labels: donutLabels.value }
    console.log('series:', donutSeries.value, 'labels:', donutLabels.value)
  } catch (e) {
    console.error('카테고리 통계 조회 실패', e)
  }
}
</script>

<template>
  <div class="admin_layout">
    <AdminSidebar />

    <div class="main_content">
      <AdminHeader />

      <div class="content">

        <!-- Today + 현황 차트 통합 섹션 -->
        <div class="today_section">
          <div class="today_header">
            <span class="today_label">Today</span>
            <div class="today_header_right">
              <div class="tab_group">
                <button class="tab_btn" :class="{ active: chartTab === 'weekly' }" @click="selectTab('weekly')">주간</button>
                <button class="tab_btn" :class="{ active: chartTab === 'yearly' }" @click="selectTab('yearly')">월간</button>
              </div>
              <div v-if="chartTab" class="dropdown_wrap">
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
          </div>

          <div class="stats_grid">
            <div class="stat_card">
              <p class="stat_label">가입자 수</p>
              <p class="stat_value">{{ dashboard.memberCount }}<span class="stat_unit">명</span></p>
            </div>
            <div class="stat_card">
              <p class="stat_label">가게등록수</p>
              <p class="stat_value">{{ dashboard.storeCount }}<span class="stat_unit">개</span></p>
            </div>
            <div class="stat_card">
              <p class="stat_label">리뷰등록수</p>
              <p class="stat_value">{{ dashboard.reviewCount }}<span class="stat_unit">개</span></p>
            </div>
          </div>

          <!-- 막대 차트: 탭 선택 시에만 표시 -->
          <div v-if="chartTab" class="bar_section">
            <div class="bar_chart_wrap">
              <div class="bar_chart">
                <div v-for="(item, idx) in chartData" :key="idx" class="bar_col">
                  <span class="bar_val">{{ item.value }}</span>
                  <div class="bar_wrapper">
                    <div class="bar" :style="{ height: barHeightPercent(item.value) + '%' }"></div>
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

        <!-- 하단 차트 2개 나란히 -->
        <div class="bottom_charts">

          <!-- 카테고리별 주문 비율 -->
          <div class="chart_section">
            <div class="chart_header">
              <span class="chart_title">카테고리별 주문 비율</span>
            </div>
            <div v-if="donutSeries.length > 0">
              <VueApexCharts type="donut" height="280" :options="donutOptions" :series="donutSeries" />
            </div>
            <div v-else class="no_data">데이터가 없습니다.</div>
          </div>

          <!-- 주문 수 추이 -->
          <div class="chart_section">
            <div class="chart_header">
              <span class="chart_title">주문 수 추이</span>
              <div class="tab_group">
                <button class="tab_btn" :class="{ active: trendPeriod === 'daily' }" @click="trendPeriod = 'daily'; fetchOrderTrend()">일별</button>
                <button class="tab_btn" :class="{ active: trendPeriod === 'weekly' }" @click="trendPeriod = 'weekly'; fetchOrderTrend()">주별</button>
              </div>
            </div>
            <VueApexCharts type="line" height="280" :options="trendOptions" :series="trendSeries" />
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.admin_layout { display: flex; min-height: 100vh; background: #ffffff; font-family: 'Noto Sans KR', sans-serif; }
.main_content { margin-left: 240px; flex: 1; display: flex; flex-direction: column; }
.content { padding: 36px 60px; display: flex; flex-direction: column; gap: 20px; }
.today_section { background: transparent; border-radius: 12px; padding: 24px 28px; }
.today_header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.today_label { font-size: 20px; font-weight: 700; color: #222; }
.today_header_right { display: flex; align-items: center; gap: 12px; }
.stats_grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.bar_section { margin-top: 24px; }
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
.no_data { text-align: center; color: #aaa; font-size: 14px; padding: 40px 0; }
.bottom_charts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
</style>