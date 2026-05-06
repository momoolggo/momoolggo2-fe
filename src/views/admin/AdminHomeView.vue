<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import adminService from '@/services/adminService'

// 피그마 기준 stat 카드 4개
const dashboard = ref({
  memberCount: 0,
  storeCount: 0,
  reviewCount: 0,
  reportCount: 0,
})

// 차트 데이터 (주간 기본)
const chartTab = ref('weekly')
const chartMetric = ref('memberCount')
const dropdownOpen = ref(false)

const metricOptions = [
  { key: 'memberCount', label: '가입자 수' },
  { key: 'storeCount', label: '가게 등록 수' },
  { key: 'reviewCount', label: '리뷰 등록 수' },
]

// 주간 더미 데이터 (API 연동 전 UI 확인용)
const weeklyData = ref([
  { label: '4일(수)', value: 30, isToday: true },
  { label: '5일(목)', value: 30, isToday: false },
  { label: '6일(금)', value: 30, isToday: false },
  { label: '7일(토)', value: 30, isToday: false },
  { label: '8일(일)', value: 30, isToday: false },
  { label: '9일(월)', value: 30, isToday: false },
  { label: '10일(화)', value: 30, isToday: false },
  { label: '11일(수)', value: 0, isToday: false },
])

const maxBarValue = ref(30)

onMounted(async () => {
  try {
    const res = await adminService.getDashboard()
    if (res?.resultData) {
      dashboard.value = {
        memberCount: res.resultData.memberCount ?? res.resultData.totalMembers ?? 143,
        storeCount: res.resultData.storeCount ?? res.resultData.totalStores ?? 35,
        reviewCount: res.resultData.reviewCount ?? res.resultData.totalReviews ?? 88,
        reportCount: res.resultData.reportCount ?? res.resultData.totalReports ?? 7,
      }
    }
  } catch (e) {
    console.error('대시보드 조회 실패', e)
    // 피그마 더미값 유지
    dashboard.value = {
      memberCount: 143,
      storeCount: 35,
      reviewCount: 88,
      reportCount: 7,
    }
  }
})

const selectedMetricLabel = () =>
  metricOptions.find((m) => m.key === chartMetric.value)?.label ?? '가입자 수'

const selectMetric = (key) => {
  chartMetric.value = key
  dropdownOpen.value = false
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
      <!-- 헤더 -->
      <header class="top_header">
        <div class="header_left">
          <img src="@/assets/로고수정.png" alt="logo" class="header_logo_img" />
          <span class="header_title">관리자 서비스</span>
        </div>
        <span class="admin_greeting">관리자 님 안녕하세요</span>
      </header>

      <!-- 본문 -->
      <div class="content">

        <!-- Today 통계 카드 4개 -->
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
            <div class="stat_card">
              <p class="stat_label">신고수</p>
              <p class="stat_value">
                {{ dashboard.reportCount }}<span class="stat_unit">개</span>
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
                <button
                  class="tab_btn"
                  :class="{ active: chartTab === 'weekly' }"
                  @click="chartTab = 'weekly'"
                >주간</button>
                <button
                  class="tab_btn"
                  :class="{ active: chartTab === 'monthly' }"
                  @click="chartTab = 'monthly'"
                >월간</button>
                <button
                  class="tab_btn"
                  :class="{ active: chartTab === 'yearly' }"
                  @click="chartTab = 'yearly'"
                >연간</button>
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
          <div class="bar_chart">
            <div
              v-for="(item, idx) in weeklyData"
              :key="idx"
              class="bar_col"
            >
              <span class="bar_val">{{ item.value }}</span>
              <div class="bar_wrapper">
                <div
                  class="bar"
                  :class="{ today: item.isToday }"
                  :style="{ height: barHeightPercent(item.value) + '%' }"
                ></div>
              </div>
              <span class="bar_label">{{ item.label }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── 레이아웃 ─── */
.admin_layout {
  display: flex;
  min-height: 100vh;
  background:rgb(255, 255, 255)0;
  font-family: 'Noto Sans KR', sans-serif;
}

.main_content {
  margin-left: 220px;   /* AdminSidebar 너비에 맞게 */
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ─── 헤더 ─── */
.top_header {
  background: #9b1b1b;
  padding: 14px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header_left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header_logo_img {
  width: 80px;
  height: auto;
}

.header_title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.admin_greeting {
  font-size: 13px;
  color: #fff;
}

/* ─── 본문 ─── */
.content {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ─── Today 섹션 ─── */
.today_section {
  background: #fff;
  border-radius: 12px;
  padding: 24px 28px;
}

.today_label {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin-bottom: 16px;
}

.stats_grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat_card {
  background: #f5f5f5;
  border-radius: 10px;
  padding: 18px 20px;
}

.stat_label {
  font-size: 12px;
  color: #777;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat_value {
  font-size: 30px;
  font-weight: 800;
  color:#9b1b1b;
  line-height: 1;
}

.stat_unit {
  font-size: 15px;
  font-weight: 600;
  color: #444;
  margin-left: 2px;
}

/* ─── 차트 섹션 ─── */
.chart_section {
  background: #fff;
  border-radius: 12px;
  padding: 24px 28px;
}

.chart_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.chart_title_row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.chart_title {
  font-size: 15px;
  font-weight: 700;
  color: #222;
}

/* 탭 */
.tab_group {
  display: flex;
  gap: 4px;
}

.tab_btn {
  background: none;
  border: none;
  font-size: 13px;
  color: #aaa;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  transition: color 0.15s;
}

.tab_btn.active {
  color:#9b1b1b;
  font-weight: 700;
}

.tab_btn:hover:not(.active) {
  color: #666;
}

/* 드롭다운 */
.dropdown_wrap {
  position: relative;
}

.dropdown_btn {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 110px;
  justify-content: space-between;
}

.dropdown_arrow {
  font-size: 10px;
  color: #999;
}

.dropdown_menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 130px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 20;
  overflow: hidden;
}

.dropdown_item {
  display: block;
  width: 100%;
  padding: 9px 14px;
  font-size: 13px;
  color: #333;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}

.dropdown_item:hover {
  background: #f5f5f5;
}

/* ─── 바 차트 ─── */
.bar_chart {
  display: flex;
  align-items: flex-end;
  gap: 0;
  height: 220px;
  padding-bottom: 28px; /* label 공간 */
  position: relative;
}

.bar_col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
  justify-content: flex-end;
}

.bar_val {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  font-weight: 500;
}

.bar_wrapper {
  width: 60%;
  flex: 1;
  display: flex;
  align-items: flex-end;
  max-height: calc(100% - 40px);
}

.bar {
  width: 100%;
  background: #d0d0d0;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  min-height: 4px;
}

.bar.today {
  background:#9b1b1b;
}

.bar_label {
  position: absolute;
  bottom: 0;
  font-size: 11px;
  color: #888;
  white-space: nowrap;
  text-align: center;
}
</style>