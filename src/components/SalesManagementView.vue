<script setup>
import Sidebar from '@/components/Sidebar.vue';
import { ref } from 'vue';
// import SalesChart from '@/components/SalesChart.vue';
// import SalesRankingTable from '@/components/SalesRankingTable.vue';

const activeTab = ref('일간');
const tabs = ['일간', '주간', '월간', '연간'];
</script>

<template>
  <div class="owner-layout">
  

    <main class="main-content">
      <header class="content-header">
        <div class="header-left">
          <h2>매출 현황</h2>
          <div class="tabs">
            <span 
              v-for="tab in tabs" 
              :key="tab"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >
              {{ tab }}
            </span>
          </div>
        </div>
      </header>

      <section class="chart-section">
        <div class="chart-placeholder">
          <p>차트가 들어갈 자리입니다 (디자인 참고하여 구현)</p>
        </div>
      </section>

      <section class="ranking-section">
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
            <tr>
              <td>1</td>
              <td>참돔 오차즈케</td>
              <td>42개 <span class="down">-12개</span></td>
              <td>546,000원 <span class="up">+89,000원(5.2%)</span></td>
              <td>546,000원</td>
            </tr>
            </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<style scoped>
.owner-layout { display: flex; background-color: #f9f9f9; min-height: 100vh; }
.main-content { flex: 1; padding: 40px; }

.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.header-left { display: flex; align-items: center; gap: 40px; }
.header-left h2 { font-size: 22px; font-weight: bold; }

.tabs { display: flex; gap: 20px; color: #bbb; cursor: pointer; font-weight: bold; }
.tabs span.active { color: #333; border-bottom: 2px solid #333; }

.chart-section { background: #fff; padding: 30px; border-radius: 20px; margin-bottom: 40px; min-height: 300px; }

.ranking-section h3 { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
.sales-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 20px; overflow: hidden; }
.sales-table th { padding: 15px; border-bottom: 1px solid #eee; color: #666; font-size: 14px; }
.sales-table td { padding: 20px; text-align: center; border-bottom: 1px solid #eee; }

.up { color: #ff4d4f; font-size: 12px; }
.down { color: #1890ff; font-size: 12px; }
</style>