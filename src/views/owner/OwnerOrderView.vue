<script setup>
import { ref, computed, onMounted } from 'vue'; //ref : 반응형 변수, 계산된 속성: computed
import Sidebar from '@/components/owner/Sidebar.vue';
import OrderCard from '@/components/owner/OrderCard.vue';
import OrderList from '@/components/owner/OrderList.vue';
import OwnerMenu from '@/components/owner/OwnerMenu.vue';
import salesManagementView from '@/components/owner/SalesManagementView.vue'
import axios from 'axios';

const state = ref({ //이거 데이터베이스에 있나..?
  totla: 0,
  watitng: 0,
  completed: 0,
  cancel: 0
});

const fetchState = async () => { //ordercard 그날 주문 데이터 연결 코드
  try{
    const response = await axios.get('/api/owner/order', {params: {store_id: 1}});
    state.value = response.data;
  } catch (error) {
    console.error("통계 조회 실패:" ,error);
  }
};

onMounted(fetchState);

const currentMenu = ref('order'); // 현재 어떤 화면을 보여줄지 결정 기본값은 주문 관리

const formattedDate = computed(() => {
  const now = new Date(); //오늘 날짜 자동계산해주는 변수.
  return `${now.getFullYear()} / ${String(now.getMonth() + 1).padStart(2, '0')} / ${String(now.getDate()).padStart(2, '0')}`;
  //          지금 연도         /   월 가져옴, 자바는 1월이 0이라 +1 , padStrart: 글자길이 2글자로 맞추되, 모자라면 0 붙임.
});
</script>

<template>
  <div class="owner-layout">
    <Sidebar :activeMenu="currentMenu" @menu-change="menu => currentMenu = menu" />
      <!--activeMenu:현재 메뉴 알려주고, @menu-change: 사이드바에서 메뉴 클릭하면 메인화면 변수 바꿔줌 -->
    <main class="main-content">
      <!--주문관리 화면-->>
      <template v-if="currentMenu === 'order'">
        <div class="date-container"><span class="date-text">📅 {{ formattedDate }}</span></div>

        <!--주문현황 요약해서 보여줌-->
        <section class="summary-container">
          <OrderCard title="총 주문수" count="stats.total" />
          <OrderCard title="주문수락대기" count="stats.waiting" />
          <OrderCard title="배달 완료" count="stats.completed" />
          <OrderCard title="취소건수" count="stats.cancel" type="cancel" />
        </section>
        <!--실제 주문 목록들을 상세히 보여주는 리스트임-->
        <section class="order-list-section"><OrderList /></section>
      </template>

      <!--매출관리 화면: 매출관리 통계, 그래프 들어있는 컴포넌트 보여줌-->
      <template v-if="currentMenu === 'sales'">
        <div><salesManagementView/></div>
      </template>
      
      <!--매뉴관리 화면: 카테고리설정및 메뉴추가 컴포넌트-->
      <template v-if="currentMenu === 'menu'">
        <div> <OwnerMenu/></div>
        </template>
    </main>
  </div>
</template>

<style scoped>
.owner-layout { display: flex; min-height: 100vh; background-color: #f9f9f9; }
.main-content { flex: 1; padding: 40px; }
.date-container { display: flex; justify-content: flex-end; margin-bottom: 30px; }
.date-text { background-color: #fff; padding: 10px 20px; border-radius: 8px; border: 1px solid #e0e0e0; font-weight: bold; color: #333; }
.summary-container { display: flex; gap: 20px; margin-bottom: 50px; }
.header-title { margin-bottom: 20px; }
.chart-section { background: #fff; padding: 30px; border-radius: 20px; margin-bottom: 40px; }
.ranking-section h3 { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
</style>