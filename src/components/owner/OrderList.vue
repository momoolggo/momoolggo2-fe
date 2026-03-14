<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import OrderDetailModal from '@/components/owner/OrderDetailModal.vue'; // 모달 파일 경로 확인 필수

const orders = ref([]); //서버에서 받아온 주문을 담을 공간
const modalOpen = ref(false); //상세정보모달을 결정하는 스위치. 처음에 페이지열었을땐 닫힘상태라서 false
const selectedOrder = ref(null); //사장이 클릭한 주문정보를 담아두는 공간. 첨에 아무것도 선택안해서 null임.
//만약, 1번 주문을 클릭하면 1번주문의 상세정보가 들어가고 OrderDetailModal컴포넌트가 보관함을 보고 1번상세창을 그려줌

// 서버에게 주문내역 보내달라고 보내고 답장받는 애
const fetchOrders = async () => {
  try { //서버에 주문목록달라고 시도
    const response = await axios.get('/api/owner/order', {
  params: { store_id: 3 }, //1번 가게 주문만 보내달라함.
  withCredentials: true //사장님 로그인 정보를 같이 보내서, '내 가게' 주문만 가져옴
});
    console.log(response.data); //서버가 뭐래?
    orders.value = response.data.resultdata ?? []; //서버가 준 주문덩어리를 order에 담음 내용이 없으면 빈[]채로
  } catch (error) { //서버연결이안되면
    console.error("주문 조회 실패:", error); //기록
  }
};

const openModal = (order) => { //사장이 클릭한 주문정보(order)가 이 괄호 안에 들어옴
  selectedOrder.value = order; //사장이 클릭한 주문정보를 'selectedOrder' 보관함에 넣음
  modalOpen.value = true; //이제 상세 창 열라고 모달 스위치를 켬
};

const getStatusInfo = (status) => { //상태를 통역해줌. 영어상태 글자를 받음
  const statusInfo = {
    'WAITING': { text: '주문 수락 대기', class: 'waiting' },
    'PROGRESS': { text: '주문 진행 중', class: 'progress' },
    'SHIPPING': { text: '배달 중', class: 'shipping' },
    'CANCEL': { text: '주문취소', class: 'cancel' }
  };
  return statusInfo[status] || { text: '알 수 없음', class: 'waiting' }; //사장이 받은 글자가 statusInfo에 있으면 값을 주고 없으면 '알수없음'
};

onMounted(fetchOrders); //사장님서비스 들어오자마자 orderlist띄움!

</script>

<template>
  <div class="list-container">
    <div class="title-area">
      <h2 class="main-title">신규 주문</h2>
    </div>

    <div class="table-header">
      <span class="col-no">NO.</span>
      <span class="col-time">주문시간</span>
      <span class="col-duration">소요시간</span>
      <span class="col-addr">주소</span>
      <span class="col-menu">메뉴</span>
      <span class="col-price">결제금액</span>
      <span class="col-status">상태</span>
    </div>

    <div v-for="(order, index) in orders" :key="index" class="order-item" @click="openModal(order)">
      <span class="col-no">{{ order.no }}</span>
      <span class="col-time">{{ order.time }}</span>
      <span class="col-duration">{{ order.duration }}</span>
      <span class="col-addr">{{ order.address }}</span>
      <span class="col-menu">{{ order.menu }}</span>
      <span class="col-price">{{ order.price }}</span>
      <span class="col-status">
        <button class="status-btn" :class="getStatusInfo(order.status).class">
          {{ getStatusInfo(order.status).text }}
        </button>
      </span>
    </div>

    <div v-if="orders.length === 0" class="no-data">
      현재 들어온 신규 주문이 없습니다.
    </div>

    <OrderDetailModal 
      v-if="modalOpen" 
      :order="selectedOrder" 
      @close="modalOpen = false" 
    />
  </div>
</template>
  
  <style scoped>
  /* 타이틀 영역 */
  .title-area {
    border-top: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    padding: 18px 0;
    margin-bottom: 25px;
    text-align: center;
  }
  .main-title { font-size: 20px; font-weight: bold; color: #333; margin: 0; }
  
  /* 정렬 */
  .table-header, .order-item {
    display: flex;
    align-items: center;
    padding: 12px 25px;
    text-align: center; /* 텍스트 정중앙 배치 */
  }
  
  .table-header {
    color: #999;
    font-size: 15px;
    font-weight: bold;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 10px;
  }
  
  .order-item {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    margin-bottom: 20px;
    font-size: 14px;
  }
  
  /* 각 컬럼 너비 설정 */
  .col-no { flex: 0.6; }
  .col-time { flex: 1; }
  .col-duration { flex: 0.8; }
  .col-addr { flex: 3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .col-menu { flex: 2.2; }
  .col-price { flex: 1.2; }
  .col-status { flex: 1.5; display: flex; justify-content: center; }
  
  /* 상태 버튼 스타일 */
  .status-btn {
    width: 110px;
    padding: 7px 0;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: bold;
    color: #fff;
  }
  
  /* 상태별 색상 */
  .waiting { background-color: #e2e4e8; color: #4f5e7b; }
  .progress { background-color: #4caf50; }
  .shipping { background-color: #5e2bed; }
  .cancel { background-color: #e63911; }
  
  .no-data { text-align: center; padding: 50px; color: #aaa; }
  </style>