<script setup>
import { reactive, onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import orderService from '@/services/orderService'
import CartView from './CartView.vue'
import { useUserStore } from '@/stores/userStore'
import cartService from '@/services/cartService'
import { showAlert } from '@/composables/useAlert'

const userStore = useUserStore()
const userNo = computed(() => userStore.state.userNo)



const router = useRouter()

const state = reactive({
  storeName: '',
  tel: '',
  address: '',
  addressDetail: '',
  items: [],
  menuTotal: 0,
  deliveryFee: 0,
  totalAmount: 0,
  request: '',
  riderRequest: '',
  payState: 1,
})

let widgets = null
const isWidgetReady = ref(false)

const loadTossScript = () => {
  return new Promise((resolve, reject) => {
    if (window.TossPayments) return resolve()
    const script = document.createElement('script')
    script.src = 'https://js.tosspayments.com/v2/standard'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const initTossWidget = async (amount) => {
  const CLIENT_KEY = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
  const CUSTOMER_KEY = 'eK4YFpGSvYQvtfwVK6L3a'

  const tossPayments = window.TossPayments(CLIENT_KEY)
  widgets = tossPayments.widgets({ customerKey: CUSTOMER_KEY })

  await widgets.setAmount({ currency: 'KRW', value: amount })

  await Promise.all([
    widgets.renderPaymentMethods({
      selector: '#payment-method',
      variantKey: 'DEFAULT',
    }),
    widgets.renderAgreement({
      selector: '#agreement',
      variantKey: 'AGREEMENT',
    }),
  ])

  isWidgetReady.value = true
}

const loadOrderInfo = async () => {
  try {
    const res = await orderService.getOrderInfo()
    const data = res.resultData
    state.storeName = data.storeName
    state.tel = data.tel
    state.address = data.address
    state.addressDetail = data.addressDetail
    state.items = data.items
    state.menuTotal = data.menuTotal
    state.deliveryFee = data.deliveryFee
    state.totalAmount = data.totalAmount
  } catch (e) {
    console.error('주문 정보 로드 실패:', e)
    state.storeName = '테스트 가게'
    state.tel = '01012341234'
    state.address = '서울시 강남구'
    state.addressDetail = '101호'
    state.items = [{ name: '테스트 메뉴' }]
    state.menuTotal = 45000
    state.deliveryFee = 3000
    state.totalAmount = 48000
  }

  try {
    await loadTossScript()
    await initTossWidget(state.totalAmount)
  } catch (e) {
    console.error('토스 위젯 초기화 실패:', e)
  }
}

onMounted(loadOrderInfo)

const handleOrder = async () => {
  if (!state.address) {
    await showAlert('배송지를 설정해주세요.', { title: '배송지 필요', type: 'warning' })
    return
  }
  if (!isWidgetReady.value) {
    await showAlert('결제 위젯이 아직 준비되지 않았습니다.', { title: '잠시만요', type: 'info' })
    return
  }

  try {
    // ✅ 1. 주문 저장 → 서버에서 발급한 orderId 사용
    const orderRes = await orderService.placeOrder({
      request:      state.request,
      riderRequest: state.riderRequest,
      payState:     state.payState,
    })
    const orderId = String(orderRes.orderId)
    console.log('주문 저장 성공, orderId:', orderId)

    await cartService.clearCart(userNo.value)

    // ✅ 2. payState 저장 (success 페이지에서 사용)
    sessionStorage.setItem('payState', state.payState)

    // ✅ 3. 주문명 생성
    const orderName =
      state.items.length > 1
        ? `${state.items[0].name} 외 ${state.items.length - 1}건`
        : (state.items[0]?.name ?? '주문')

    // ✅ 4. 토스 결제창 호출
    await widgets.requestPayment({
      orderId,
      orderName,
      successUrl: `${window.location.origin}/payment/success`,
      failUrl:    `${window.location.origin}/payment/fail`,
      customerMobilePhone: state.tel,
    })
  } catch (e) {
    console.error('결제 요청 실패:', e)
    await showAlert('결제 요청에 실패했습니다.', { title: '결제 오류', type: 'error' })
  }
}
</script>

<!-- template, style 변경 없음 -->
<template>
  <div class="order-page">
    <h2 class="order-title">결제하기</h2>

    <div class="order-layout">
      <section class="order-section">
        <div class="store-name-row">
          <img src="/favicon.png" class="store-icon" />
          <span class="store-name">{{ state.storeName }}</span>
        </div>

        <div class="info-group">
          <div class="section-label">배달 정보</div>
          <div class="input-row">
            <input
              :value="state.address + ' ' + state.addressDetail"
              readonly
              class="input-field"
            />
            <button class="change-btn">변경</button>
          </div>
        </div>

        <div class="info-group">
          <div class="section-label">휴대폰 번호</div>
          <div class="input-row">
            <input :value="state.tel" readonly class="input-field" />
            <button class="change-btn">변경</button>
          </div>
        </div>

        <div class="info-group">
          <div class="section-label">주문 요청사항 (가게)</div>
          <input
            v-model="state.request"
            placeholder="요청사항을 입력하세요"
            class="input-field full"
          />
        </div>

        <div class="info-group">
          <div class="section-label">주문 요청사항 (라이더)</div>
          <input
            v-model="state.riderRequest"
            placeholder="요청사항을 입력하세요"
            class="input-field full"
          />
        </div>
      </section>

      <section class="order-section">
        <div class="info-group">
          <div class="section-label">결제 수단</div>
          <div id="payment-method"></div>
          <div id="agreement"></div>
        </div>

        <div class="info-group">
          <div class="section-label">쿠폰 선택 <span class="badge">2차 개발</span></div>
          <select class="input-field full" disabled>
            <option>사용 가능한 쿠폰이 없습니다</option>
          </select>
        </div>

        <div class="price-box">
          <div class="price-row">
            <span>메뉴 금액</span>
            <span>{{ state.menuTotal.toLocaleString() }}원</span>
          </div>
          <div class="price-row">
            <span>배달팁</span>
            <span>{{ state.deliveryFee.toLocaleString() }}원</span>
          </div>
          <div class="price-row total">
            <span>총 결제 금액</span>
            <span class="total-price">{{ state.totalAmount.toLocaleString() }}원</span>
          </div>
        </div>

        <button class="order-btn" @click="handleOrder" :disabled="!isWidgetReady">
          {{ isWidgetReady ? `${state.totalAmount.toLocaleString()}원 결제하기` : '로딩 중...' }}
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.order-page {
  max-width: 480px;
  width: 100%;
  padding: 20px 16px 100px;
  box-sizing: border-box;
  margin: 0 auto;
}
.order-title {
  text-align: left;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 20px;
}
.order-layout {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.order-section {
  display: flex;
  flex-direction: column;
}
.store-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.store-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}
.info-group {
  margin-bottom: 20px;
}
.section-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 8px;
}
.input-row {
  display: flex;
  gap: 8px;
}
.input-field {
  flex: 1;
  min-width: 0;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f9f9f9;
}
.input-field.full {
  width: 100%;
  box-sizing: border-box;
}
.change-btn {
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
}
.badge {
  background: #ff4d4f;
  color: #fff;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  vertical-align: middle;
}
.price-box {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0 20px;
}
.price-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  padding: 6px 0;
}
.price-row.total {
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-weight: 700;
}
.total-price {
  color: #4a90e2;
  font-size: 1.1rem;
}
.order-btn {
  width: 100%;
  padding: 16px;
  background: #4a90e2;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.order-btn:active {
  background: #357abd;
}
.order-btn:disabled {
  background: #ccc;
}
#payment-method {
  margin-left: -8px;
  margin-right: -8px;
}
</style>
