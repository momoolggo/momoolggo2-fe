<script setup>
import router from '@/router'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import orderService from '@/services/orderService';
import { showAlert, showConfirm } from '@/composables/useAlert';
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
  // 금액 관련 필드
  // amount는 백엔드 orders.amount 기준, 즉 쿠폰 할인 반영 후 최종 결제금액이어야 함
  amount: null,
  totalAmount: null,
  paymentAmount: null,
  couponDiscount: 0,
  orderState: 1     // 기본값: 주문수락전(1)
})

const isCanceling = ref(false)
const selectedCancelReason = ref('')
const customCancelReason = ref('')
const isCancelModalOpen = ref(false)

const cancelReasons = [
  '단순 변심',
  '메뉴 또는 수량을 잘못 선택했어요',
  '배달 주소를 잘못 입력했어요',
  '결제 수단을 변경하고 싶어요',
  '쿠폰 또는 할인을 적용하지 못했어요',
  '기타',
]

const loadOrderDetail = async () => {
  const result = await orderService.getOrderDetail(id)
  // 서버 응답이 resultData로 감싸져 오거나, 바로 객체로 오는 경우 모두 대응
  order.value = result?.resultData ?? result
}

onMounted(async () => {
  await loadOrderDetail()
  await loadOrderStatus()
  connectOrderStatusSse()
})

onBeforeUnmount(() => {
  eventSource.value?.close()
})

// 메뉴 금액
const menuTotal = computed(() => {
  return order.value.items?.reduce((sum, item) => {
    return sum + Number(item.price || 0)
  }, 0) || 0
})

// 메뉴 금액 + 배달팁 기준 할인 전 금액
// 백엔드가 내려준 최종 결제금액
// 쿠폰 할인 금액
// 1순위: 주문 상세 API에 내려온 할인 금액
// 2순위: 할인 전 금액 - 백엔드 최종 결제금액으로 역산
const couponDiscount = computed(() => {
  const discount = Number(order.value.couponDiscount || 0)
  if (discount > 0) return discount

  if (totalPrice.value > 0) {
    return Math.max(menuTotal.value + Number(order.value.deliveryFee || 0) - totalPrice.value, 0)
  }

  return 0
})

// 총 결제 금액
// 1순위: 백엔드가 내려준 최종 결제금액
// 2순위: 메뉴금액 + 배달팁 - 쿠폰할인
const totalPrice = computed(() => {
  return Number(order.value.amount || order.value.totalPrice || 0)
})
/**
 * 수빈님의 확정 상태값 규칙 적용
 * 1: 주문수락전 (주문확인중)
 * 2: 주문취소
 * 3, 4: 조리중 (주문수락/라이더배차중 통합)
 * 5: 배달중 (라이더배차완료)
 * 6: 배달완료
 */

const canCancelOrder = computed(() => !!order.value.orderId && currentOrderState.value === 1 )

const openCancelModal = () => {
  selectedCancelReason.value = ''
  customCancelReason.value = ''
  isCancelModalOpen.value = true
}

const closeOptionModal = () => {
  showOptionModal.value = false
  showOptionForm.value = false
  selectedMenu.value = null
  optionCategories.value = []
  resetOptionForm()
}

const cancelOrder = async () => {
  const reason = selectedCancelReason.value === '기타' 
                      ? customCancelReason.value.trim()
                      : selectedCancelReason.value

  if(!reason) {
    await showAlert('취소 사유를 입력해 주세요', { title: ' 주문 취소', type: 'warning'})
    return
  }

const confirmed = await showConfirm( 
  '주문을 취소하시겠습니까?', { title: '주문 취소', type: 'warning'}
)

if(!confirmed) return

  try {
    isCanceling.value = true
    await orderService.cancelOrder(order.value.orderId, {
      reason,
    })
    await showAlert('주문이 취소되었습니다', { title: ' 주문 취소', type: 'success'})
    isCancelModalOpen.value = false
    selectedCancelReason.value = ''
    customCancelReason.value = ''
    
    await loadOrderDetail()
  } catch (error) {
    console.error('주문 취소 실패:', error.response?.status, error.response?.data)
    
    const message = 
    error.response?.data?.resultMessage || error.response?.data?.message ||
    '주문 취소 실패했습니다'
    await showAlert(message, { title: '주문 취소 실패', type: 'error'})
  } finally {
    isCanceling.value = false
  }
}

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

const eventSource = ref(null)

const deliveryStatus = ref({
  orderId: null,
  orderState: null,
  orderStateText: '',
  deliveryState: null,
  deliveryStateText: '',
})

const applyDeliveryStatus = (data) => {
  const status = data?.resultData ?? data
  if (!status) return

  const nextDeliveryState = status.deliveryState ?? status.newDeliveryState

  deliveryStatus.value = {
    orderId: status.orderId,
    orderState: status.orderState ?? deliveryStatus.value.orderState,
    orderStateText: status.orderStateText || deliveryStatus.value.orderStateText,
    deliveryState: nextDeliveryState ?? deliveryStatus.value.deliveryState,
    deliveryStateText: status.deliveryStateText || deliveryStatus.value.deliveryStateText,
  }

  if (status.orderState != null) {
    order.value.orderState = Number(status.orderState)
  }
}

const currentOrderState = computed(() => {
  const deliveryState = Number(deliveryStatus.value.deliveryState)

  if (deliveryState === 2) return 5
  if (deliveryState === 3) return 6

  return Number(order.value.orderState)
})

const loadOrderStatus = async () => {
  try {
    const res = await orderService.getOrderStatus(id)
    console.log('현재 배달 현황 조회 응답:', res)
    applyDeliveryStatus(res)
  } catch(error) {
    console.error('배달 현황 조회 실패:', error)
  }
}


const connectOrderStatusSse = () => {
  if(!id) return

  eventSource.value?.close()

  eventSource.value = new EventSource(
    `/api/order/${id}/status/subscribe`,
    { withCredentials: true }
  )
  eventSource.value.addEventListener('delivery-status', async (event) => {
  const data = JSON.parse(event.data)
  console.log('delivery-status', data)

  applyDeliveryStatus(data)
  await loadOrderStatus()
})

eventSource.value.onerror = (error) => {
    console.error('배달 현황 SSE 오류:', error)
  }
}

const closeCancelModal = () => {
  isCancelModalOpen.value = false
  selectedCancelReason.value = ''
  customCancelReason.value = ''
}

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
          <div v-if="couponDiscount > 0" class="menu-item discount">
            <span class="name">쿠폰 할인</span>
            <span class="spacer"></span>
            <span class="price">-{{ couponDiscount.toLocaleString() }}원</span>
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

        <!-- 자잘 에러 트랙 #9-B (2026-05-23) — 배달 완료 사진 (orderState=6 + deliveredPhotoUrl 있을 때만) -->
        <div v-if="currentOrderState === 6 && order.deliveredPhotoUrl" class="delivered-photo-section">
          <h3 class="delivered-photo-title">배달 완료 사진</h3>
          <img :src="getImageUrl(order.deliveredPhotoUrl)" alt="배달 완료 사진" class="delivered-photo" />
        </div>
      </div>

      <button
        v-if="canCancelOrder"
        class="btn-cancel-order"
        :disabled="isCanceling"
        @click="openCancelModal">
      {{ isCanceling ? '주문 취소 처리 중' : '주문 취소' }}
      </button>

      <button :class="currentOrderState === 2 ? 'btn-reorder' : 'btn-continue'"  @click="router.push('/storelist')">
        {{ currentOrderState === 2 ? '다시 주문하기' : '주문 계속하기' }}
      </button>

      <div class="nav-spacer"></div>
    </div>
  </div>

  <!--주문 취소 사유 모달-->
<div v-if="isCancelModalOpen" class="cancel-modal-overlay" @click.self="closeCancelModal">
  <div class="cancel-modal">
    <div class="cancel-modal-header">
      <h3>주문 취소 사유</h3>
      <button type="button" class="cancel-modal-close" @click="closeCancelModal">
        <i class="bi bi-x"></i>
      </button>
    </div>

    <p class="cancel-modal-desc">취소 사유를 선택해 주세요!</p>

    <div class="cancel-reason-list">
      <label
        v-for="reason in cancelReasons"
        :key="reason"
        class="cancel-reason-item"
        :class="{ selected: selectedCancelReason === reason }"
      >
        <input
          v-model="selectedCancelReason"
          type="radio"
          name="cancelReason"
          :value="reason"
        />
        <span>{{ reason }}</span>
      </label>
    </div>

    <textarea
      v-if="selectedCancelReason === '기타'"
      v-model="customCancelReason"
      class="cancel-reason-textarea"
      placeholder="취소 사유를 입력해 주세요"
      maxlength="100"
    ></textarea>

    <div class="cancel-modal-actions">
      <button
        type="button"
        class="btn-cancel-modal-close"
        :disabled="isCanceling"
        @click="closeCancelModal"
      >
        닫기
      </button>

      <button
        type="button"
        class="btn-cancel-modal-submit"
        :disabled="isCanceling"
        @click="cancelOrder"
      >
        {{ isCanceling ? '처리 중...' : '주문 취소' }}
      </button>
    </div>
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
.menu-item.discount {
  color: #b21f1f;
  font-weight: 800;
}
.menu-item.discount .price {
  color: #b21f1f;
  font-weight: 800;
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
  color: #584949;
  font-size: 21px;
}

/* 자잘 에러 트랙 #9-B (2026-05-23) — 배달 완료 사진 섹션 */
.delivered-photo-section {
  margin-top: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.delivered-photo-title {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin: 0;
}
.delivered-photo {
  width: 100%;
  max-width: 360px;
  max-height: 320px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.delivery-live-text {
  margin-bottom: 18px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff4f4;
  color: #b21f1f;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
}


/* 버튼 스타일 */

.btn-cancel-order {
  width: 100%;
  padding: 16px;
  border-radius: 15px;
  border: 1.5px solid #b21f1f;
  background: #fff;
  color: #b21f1f;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  margin-bottom: 12px;
}

.btn-cancel-order:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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

.cancel-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.cancel-modal {
  width: 100%;
  max-width: 360px;
  max-height: 86vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 20px;
  padding: 22px 20px 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
}

.cancel-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.cancel-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #222;
  white-space: nowrap;
}

.cancel-modal-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.cancel-modal-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #777;
}

.cancel-reason-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.cancel-reason-item {
  width: 100%;
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1.5px solid #e5e3dc;
  border-radius: 12px;
  background: #fff;
  color: #333;
  font-size: 14px;
  line-height: 1.4;
  cursor: pointer;
  box-sizing: border-box;
}

.cancel-reason-item.selected {
  border-color: #b21f1f;
  background: #fff5f5;
  color: #b21f1f;
  font-weight: 700;
}

.cancel-reason-item input {
  flex-shrink: 0;
  accent-color: #b21f1f;
}

.cancel-reason-item span {
  flex: 1;
  min-width: 0;
  white-space: normal;
  word-break: keep-all;
}

.cancel-reason-textarea {
  width: 100%;
  min-height: 82px;
  margin-top: 10px;
  padding: 12px 14px;
  border: 1.5px solid #e5e3dc;
  border-radius: 12px;
  resize: none;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
  box-sizing: border-box;
}

.cancel-reason-textarea:focus {
  border-color: #b21f1f;
}

.cancel-modal-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 18px;
}

.btn-cancel-modal-close,
.btn-cancel-modal-submit {
  flex: 1;
  height: 46px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.btn-cancel-modal-close {
  border: 1.5px solid #ddd;
  background: #fff;
  color: #666;
}

.btn-cancel-modal-submit {
  border: none;
  background: #b21f1f;
  color: #fff;
}

.btn-cancel-modal-close:disabled,
.btn-cancel-modal-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>
