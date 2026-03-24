<script setup>
import router from '@/router'
import { ref, computed, onMounted } from 'vue'
import orderService from '@/services/orderService';
import { useRoute } from 'vue-router';

const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/45'
  if (path.startsWith('data:')) return path
  if (path.startsWith('http') || path.startsWith('blob')) return path
  return `${path}`
}

const route = useRoute();
const id = route.params.id;

/* 주문 데이터: 서버 응답 객체 구조에 맞춤 */
const order = ref({
  orderId: '',
  date: '',
  storeName: '',
  storeImage: null,
  storeId: '',
  items: [],
  deliveryFee: 0,
  orderState: 1     // 기본값: 주문수락전(1)
})

onMounted(async () => {
  const result = await orderService.getOrderDetail(id);
  order.value = result;
})

const totalPrice = computed(() => {
  return (order.value.items?.reduce((s, i) => s + i.price, 0) || 0) + (order.value.deliveryFee || 0)
})
/**
 * 수빈님의 확정 상태값 규칙 적용
 * 1: 주문수락전 (주문확인중)
 * 2: 주문취소
 * 3, 4: 조리중 (주문수락/라이더배차중 통합)
 * 5: 배달중 (라이더배차완료)
 * 6: 배달완료
 */
 const currentOrderState = computed(() => order.value.orderState)

/* 상태 숫자(Key)에 따른 UI 매핑 - index를 steps 순서(0, 1, 2, 3)와 일치시킴 */
const statusMap = {
  1: { index: 0, msg: '가게에서 주문 확인을 기다리고 있어요.' },
  3: { index: 1, msg: '음식이 맛있게 만들어지고 있습니다.' }, // 조리중
  4: { index: 1, msg: '음식이 맛있게 만들어지고 있습니다.' }, // 조리중 (4번도 1번 인덱스)
  5: { index: 2, msg: '라이더가 음식을 가지고 출발했습니다!' },
  6: { index: 3, msg: '배달이 완료되었습니다!' },
}

const steps = computed(() => {
  // "2026년 3월 15일(일) 오후 7:53" 에서 시간 부분만 추출 ("오후 7:53")
  // split 기준을 괄호 ')' 로 잡으면 더 안전합니다.
  const timePart = order.value.date.split('일 ')[1] ?? ''

  let arrivalTime = ''
  if (timePart) {
    const [ampm, time] = timePart.split(' ')
    const [hour, minute] = time.split(':').map(Number)

    let totalMinutes = (ampm === '오후' && hour !== 12 ? (hour + 12) * 60 : hour * 60) + minute + 40

    let newHour24 = Math.floor(totalMinutes / 60) % 24
    let newAmpm = newHour24 >= 12 ? '오후' : '오전'
    let newHour12 = newHour24 % 12 || 12
    let newMinute = totalMinutes % 60

    arrivalTime = `${newAmpm} ${newHour12}:${String(newMinute).padStart(2, '0')}`
  }

  return [
    { key: 1, label: '주문 확인', time: timePart },
    { key: 3, label: '조리 중', time: '' }, // 3, 4번 공용
    { key: 5, label: '배달 중', time: '' },
    { key: 6, label: '배달 완료', time: arrivalTime },
  ]
})

// 현재 상태에 따른 인덱스 및 메시지 계산
// 4번일 때도 1번 인덱스를 가져오도록 수정됨
const currentStepIndex = computed(() => statusMap[currentOrderState.value]?.index ?? 0)
const statusMessage = computed(
  () => statusMap[currentOrderState.value]?.msg ?? '상태 확인 중...',
)
const progressWidth = computed(() => (currentStepIndex.value / (steps.value.length - 1)) * 100 + '%')
</script>

<template>
  <div class="wrap">
    <div class="container">
      <div class="title">{{ currentOrderState === 2 ? '주문 취소' : '주문 완료' }}</div>

      <div class="card shadow-sm">
        <div class="card-header">
          <span class="header-title">주문 내역</span>
          <div class="header-info">
            <div class="info-row">
              <span class="label">주문일시</span> <span class="value">{{ order.date }}</span>
            </div>
            <div class="info-row">
              <span class="label">주문번호</span> <span class="value">{{ order.orderId }}</span>
            </div>
          </div>
        </div>

        <div class="store-info"  @click="router.push(`/store/${order.storeId}`)">
          <img :src="getImageUrl(order.storeImage)" class="store-thumb" />
          <span class="store-name">{{ order.storeName }}</span>
        </div>

        <div class="divider"></div>

        <div class="menu-list">
          <div class="menu-item" v-for="item in order.items" :key="item.name">
            <span class="name" >{{ item.name }}</span>
            <span class="count">{{ item.count }}개</span>
            <span class="price">{{ item.price.toLocaleString() }}원</span>
          </div>
          <div class="menu-item delivery">
            <span class="name">배달팁</span>
            <span class="spacer"></span>
            <span class="price">{{ (order.deliveryFee || 0).toLocaleString() }}원</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="total-row">
          <span>총 결제 금액</span>
          <span class="total-price">{{ totalPrice.toLocaleString() }}원</span>
        </div>
      </div>

      <div v-if="currentOrderState === 2" class="card shadow-sm cancel-card">
        <div class="cancel-content">
          <div class="warning-icon">⚠️</div>
          <div class="cancel-text">주문이 취소되었습니다</div>
        </div>
      </div>

      <div v-else class="card shadow-sm status-card">
        <div class="status-header">
          <span class="header-title">주문 상태</span>
          <span class="notice">※주문이 확인 되면 주문을 취소할 수 없습니다.</span>
        </div>

        <div class="step-container">
          <div
            v-for="(step, index) in steps"
            :key="step.key"
            class="step-item"
            :class="{ active: currentStepIndex == index }"
          >
            <div class="step-label">{{ step.label }}</div>
            <div class="step-time" v-if="step.time && currentStepIndex >= index">
              {{ step.time }}
            </div>
            <div class="step-time" v-if="index==3&& currentStepIndex<3">도착예정 <span> {{ step.time }}</span></div>
          </div>
        </div>

        <div class="progress-area">
          <div class="progress-bg">
            <div
              class="progress-fill"
              :class="{ 'done-bg': currentOrderState === 6 }"
              :style="{ width: progressWidth }"
            ></div>
          </div>
          <div class="bike-icon" :style="{ left: progressWidth }">
            <img src="/image/delivery.png" alt="bike" />
          </div>
        </div>

        <div class="status-footer-text" :class="{ 'done-text': currentOrderState === 6 }">
          {{ statusMessage }}
        </div>
      </div>

      <button :class="currentOrderState === 2 ? 'btn-reorder' : 'btn-continue'"  @click="router.push('/storelist')">
        {{ currentOrderState === 2 ? '다시 주문하기' : '주문 계속하기' }}
      </button>

      <div class="nav-spacer"></div>
    </div>
  </div>
</template>

<style scoped>
/* 기존 스타일 유지 + 취소/상태별 추가 스타일 */
.wrap {
  background: #ffffff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  max-width: 480px;
  margin: 0 auto;
}
.container {
  width: 100%;
  max-width: 480px;
  padding: 20px 15px;
}
.title {
  text-align: center;
  font-size: 19px;
  font-weight: 800;
  margin-bottom: 20px;
}
.card {
  background: #fff;
  border-radius: 25px;
  padding: 22px;
  margin-bottom: 15px;
  border: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 주문 내역 관련 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}
.header-title {
  font-size: 16px;
  font-weight: 800;
}
.header-info {
  text-align: right;
}
.info-row {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-bottom: 2px;
}
.label {
  font-size: 11px;
  color: #bbb;
}
.value {
  font-size: 11px;
  color: #999;
}
.store-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 15px 0;
}
.store-thumb {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}
.store-name {
  font-size: 19px;
  font-weight: 800;
}
.store-info :hover {
  color: #4a80da;
  cursor: pointer;
}
.divider {
  height: 1px;
  background: #f2f2f2;
  margin: 15px 0;
}
.menu-item {
  display: grid;
  grid-template-columns: 1fr 50px 90px;
  align-items: center;
  font-size: 15px;
  margin-bottom: 12px;
  color: #333;
}
.menu-item .count {
  color: #aaa;
  text-align: left;
  padding-left: 10px;
}
.menu-item .price {
  text-align: right;
  font-weight: 500;
}
.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 17px;
  font-weight: 800;
}
.total-price {
  font-size: 19px;
}

/* 주문 취소 카드 스타일 */
.cancel-card {
  background: #e9ecef;
  border: none;
  padding: 40px 20px;
  text-align: center;
}
.cancel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.warning-icon {
  font-size: 50px;
  color: #f1c40f;
}
.cancel-text {
  font-size: 22px;
  font-weight: 800;
  color: #333;
}

/* 배달 현황 관련 스타일 */
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.notice {
  font-size: 11px;
  color: #ccc;
}
.step-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 35px;
}
.step-item {
  flex: 1;
  text-align: center;
  color: #131212;
  font-weight: 800;
}
.step-item.active {
  color: #af1111;
}
.step-label {
  font-size: 14px;
  margin-bottom: 5px;
}
.step-time {
  font-size: 11px;
  color: #aaa;
}

.progress-area {
  position: relative;
  margin: 0 10px 25px;
}
.progress-bg {
  height: 26px;
  background: #eee;
  border-radius: 15px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #a50000;
  transition: 0.8s ease;
}
.progress-fill.done-bg {
  background: #b00000;
}
.bike-icon {
  position: absolute;
  top: -14px;
  width: 45px;
  transform: translateX(-50%);
  transition: 0.8s ease;
}
.bike-icon img {
  width: 100%;
}
.status-footer-text {
  text-align: center;
  font-size: 20px;
  font-weight: 900;
  color: #333;
  margin-top: 10px;
}
.status-footer-text.done-text {
  color: #004ba0;
  font-size: 24px;
}

/* 버튼 스타일 */
.btn-continue,
.btn-reorder {
  width: 100%;
  padding: 16px;
  border-radius: 15px;
  border: none;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}
.btn-continue {
  background: #5b8bdc;
  color: #fff;
  box-shadow: 0 4px 10px rgba(91, 139, 220, 0.3);
}
.btn-reorder {
  background: #4a80da;
  color: #fff;
  border-radius: 20px;
  width: auto;
  min-width: 150px;
  margin: 0 auto;
  display: block;
}

.nav-spacer {
  height: 80px;
}
</style>
