<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import ownerService from '@/services/ownerService'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const activeTab = ref('일간')
const tabs = ['일간', '주간', '월간', '연간']
const periodMap = { '일간': 'day', '주간': 'week', '월간': 'month', '연간': 'year' }

const stats = ref({ orderCount: 0, totalSales: 0 })
const ranking = ref([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const period = periodMap[activeTab.value]
    const [statsRes, rankingRes] = await Promise.all([
      ownerService.getSalesStats(period),
      ownerService.getSalesRanking(period),
    ])
    stats.value = statsRes.resultData || { orderCount: 0, totalSales: 0 }
    ranking.value = rankingRes.resultData || []
  } catch (e) {
    console.error('매출 데이터 로드 실패:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
watch(activeTab, loadData)

// 차트 - 첫번째 막대만 빨간색, 나머지 회색
const chartData = computed(() => ({
  labels: ranking.value.map(r => r.menuName),
  datasets: [{
    label: '판매개수',
    data: ranking.value.map(r => r.totalQuantity),
    backgroundColor: ranking.value.map((_, i) => i === 0 ? '#A40C0B' : '#D9D9D9'),
    borderRadius: 6,
    borderSkipped: false,
  }]
}))

// 막대 위에 숫자 표시 플러그인
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
    datalabels: { display: false },
  },
  scales: {
    y: {
      display: false,
      beginAtZero: true,
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } }
    }
  },
  layout: { padding: { top: 30 } }
}

// 막대 위 숫자 표시 커스텀 플러그인
const topLabelPlugin = {
  id: 'topLabel',
  afterDatasetsDraw(chart) {
    const { ctx, data } = chart
    chart.getDatasetMeta(0).data.forEach((bar, i) => {
      const value = data.datasets[0].data[i]
      ctx.save()
      ctx.font = 'bold 12px sans-serif'
      ctx.fillStyle = '#555'
      ctx.textAlign = 'center'
      ctx.fillText(value, bar.x, bar.y - 6)
      ctx.restore()
    })
  }
}

ChartJS.register(topLabelPlugin)

const formatPrice = (price) => Number(price).toLocaleString() + '원'
</script>

<template>
  <div class="sales-wrap">

    <!-- 헤더 -->
    <div class="sales-header">
      <h2>매출 현황</h2>
      <div class="tabs">
        <span
          v-for="tab in tabs"
          :key="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >{{ tab }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading">불러오는 중...</div>

    <template v-else>

      <!-- 차트 -->
      <div class="chart-box">
        <Bar v-if="ranking.length" :data="chartData" :options="chartOptions" />
        <div v-else class="empty">데이터가 없습니다.</div>
      </div>

      <!-- 상품 매출 순위 -->
      <div class="ranking-box">
        <h3>상품 매출순위</h3>
        <table class="sales-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>상품명</th>
              <th>판매개수 | [전주] 비교</th>
              <th>판매금액</th>
              <th>실판매금액</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!ranking.length">
              <td colspan="5" class="empty-row">데이터가 없습니다.</td>
            </tr>
            <tr v-for="(item, index) in ranking" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ item.menuName }}</td>
              <td>
                {{ item.totalQuantity }}개
                <span v-if="item.prevQuantity != null" :class="item.totalQuantity >= item.prevQuantity ? 'up' : 'down'">
                  {{ item.totalQuantity >= item.prevQuantity ? '+' : '' }}{{ item.totalQuantity - (item.prevQuantity || 0) }}개
                </span>
              </td>
              <td>
                {{ formatPrice(item.totalSales) }}
                <span v-if="item.prevSales != null" :class="item.totalSales >= item.prevSales ? 'up' : 'down'">
                  {{ item.totalSales >= item.prevSales ? '+' : '' }}{{ formatPrice(item.totalSales - (item.prevSales || 0)) }}
                </span>
              </td>
              <td>{{ formatPrice(item.totalSales) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </template>
  </div>
</template>

<style scoped>
.sales-wrap {
  flex: 1;
  padding: 40px;
  background: #f9f9f9;
  min-height: 100vh;
}

/* 헤더 */
.sales-header {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 30px;
}
.sales-header h2 {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a1a;
  white-space: nowrap;
}
.tabs {
  display: flex;
  gap: 24px;
}
.tabs span {
  font-size: 14px;
  font-weight: 600;
  color: #bbb;
  cursor: pointer;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}
.tabs span.active {
  color: #A40C0B;
  border-bottom: 2px solid #A40C0B;
}
.tabs span:hover { color: #A40C0B; }

/* 차트 */
.chart-box {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  min-height: 260px;
}

/* 순위 테이블 */
.ranking-box {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.ranking-box h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}
.sales-table {
  width: 100%;
  border-collapse: collapse;
}
.sales-table th {
  padding: 12px 16px;
  border-bottom: 2px solid #eee;
  color: #888;
  font-size: 13px;
  text-align: center;
  white-space: nowrap;
}
.sales-table td {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
  color: #333;
}
.sales-table tr:last-child td { border-bottom: none; }
.sales-table tr:hover td { background: #fafafa; }

.up { color: #ff4d4f; font-size: 12px; margin-left: 6px; }
.down { color: #1890ff; font-size: 12px; margin-left: 6px; }

.loading { text-align: center; padding: 60px; color: #888; }
.empty { text-align: center; padding: 40px; color: #bbb; }
.empty-row { text-align: center; padding: 30px; color: #bbb; }
</style>