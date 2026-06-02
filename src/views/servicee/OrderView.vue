<script setup>
import { reactive, onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import orderService from '@/services/orderService'
import { showAlert } from '@/composables/useAlert'

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
  ecoSelected: false,

  // 쿠폰 관련 상태
  coupons: [],
  selectedCouponListId: '',
  couponLoading: false,
})

let widgets = null
const isWidgetReady = ref(false)
const isOrdering = ref(false)
const createdOrderId = ref('')

// 선택된 쿠폰
const selectedCoupon = computed(() =>
  state.coupons.find(coupon => String(coupon.couponListId) === String(state.selectedCouponListId)) || null
)

// 쿠폰 할인 금액
const discountAmount = computed(() => {
  if (!selectedCoupon.value) return 0
  const menuTotal = Number(state.menuTotal || 0)
  const discount = Number(selectedCoupon.value.discount || 0)

  if (selectedCoupon.value.discountType === 'PERCENT') {
    return Math.floor(menuTotal * discount / 100)
  }

  return Math.min(discount, menuTotal)
})

// 화면에 표시할 최종 결제 금액
const displayTotalAmount = computed(() => {
  const menuTotal = Number(state.menuTotal || 0)
  const deliveryFee = Number(state.deliveryFee || 0)
  const total = menuTotal - discountAmount.value + deliveryFee
  return Math.max(total, 0)
})

const formatPrice = value => `${Number(value || 0).toLocaleString()}원`
const formatCouponDiscount = coupon => {
  if (coupon.discountType === 'PERCENT') return `${Number(coupon.discount || 0)}% 할인`
  return `${Number(coupon.discount || 0).toLocaleString()}원 할인`
}

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

const initTossWidget = async amount => {
  const CLIENT_KEY = 'test_ck_AQ92ymxN34yOGwoa2XGyVajRKXvd'
  const CUSTOMER_KEY = 'eK4YFpGSvYQvtfwVK6L3a'

  const tossPayments = window.TossPayments(CLIENT_KEY)
  widgets = tossPayments.widgets({ customerKey: CUSTOMER_KEY })

  await widgets.setAmount({ currency: 'KRW', value: Number(amount) })

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

// 쿠폰 선택 후 Toss 위젯 결제 금액 동기화
const syncTossAmount = async amount => {
  if (!widgets || !isWidgetReady.value) return
  await widgets.setAmount({ currency: 'KRW', value: Number(amount) })
}

// 보유 쿠폰 목록 조회
const loadCoupons = async () => {
  state.couponLoading = true

  try {
    const res = await orderService.getUserCoupons()
    state.coupons = res.resultData || []
  } catch (e) {
    console.error('쿠폰 목록 조회 실패:', e)
    state.coupons = []
  } finally {
    state.couponLoading = false
  }
}

// 주문 화면 초기 정보 조회
const loadOrderInfo = async () => {
  try {
    const res = await orderService.getOrderInfo()
    const data = res.resultData

    state.storeName = data.storeName
    state.tel = data.tel
    state.address = data.address
    state.addressDetail = data.addressDetail
    state.items = data.items || []
    state.menuTotal = Number(data.menuTotal || 0)
    state.deliveryFee = Number(data.deliveryFee || 0)
    state.totalAmount = Number(data.totalAmount || 0)
  } catch (e) {
    console.error('주문 정보 로드 실패:', e)
    await showAlert('주문 정보를 불러오지 못했습니다.', { title: '오류', type: 'error' })
    router.push('/cart')
    return
  }

  await loadCoupons()

  try {
    await loadTossScript()
    await initTossWidget(displayTotalAmount.value)
  } catch (e) {
    console.error('토스 결제 위젯 초기화 실패:', e)
    await showAlert('결제 위젯을 불러오지 못했습니다.', { title: '결제 오류', type: 'error' })
  }
}

onMounted(loadOrderInfo)

// 쿠폰을 바꾸면 기존 생성 주문 ID를 버리고 다시 주문 생성
watch(
  () => state.selectedCouponListId,
  async () => {
    createdOrderId.value = ''
    await syncTossAmount(displayTotalAmount.value)
  }
)

watch(
  () => state.ecoSelected,
  () => {
    createdOrderId.value = ''
  }
)

const handleOrder = async () => {
  if (isOrdering.value) return

  if (!state.address) {
    await showAlert('배송지를 설정해주세요.', { title: '배송지 필요', type: 'warning' })
    return
  }

  if (!isWidgetReady.value) {
    await showAlert('결제 위젯이 아직 준비되지 않았습니다.', { title: '잠시만요', type: 'info' })
    return
  }

  isOrdering.value = true

  try {
    let paymentAmount = displayTotalAmount.value

    // 1. 주문 저장 후 서버에서 발급된 orderId 사용
    if (!createdOrderId.value) {
      const orderPayload = {
        request: state.request,
        riderRequest: state.riderRequest,
        ecoSelected: state.ecoSelected,
        payState: state.payState,
      }

      if (state.selectedCouponListId) {
        orderPayload.couponListId = Number(state.selectedCouponListId)
      }

      const orderRes = await orderService.placeOrder(orderPayload)
      const orderData = orderRes.resultData || orderRes

      createdOrderId.value = String(orderData.orderId)
      paymentAmount = Number(orderData.totalAmount)

      // 백엔드가 계산한 최종 결제 금액으로 Toss 금액 동기화
      await syncTossAmount(paymentAmount)
    }

    const orderId = createdOrderId.value
    console.log('주문 저장 성공, orderId:', orderId)

    // 2. payState 저장
    sessionStorage.setItem('payState', state.payState)

    // 3. 주문명 생성
    const firstItemName =
      state.items[0]?.menuName ||
      state.items[0]?.name ||
      '뭐물꼬 주문'

    const orderName =
      state.items.length > 1
        ? `${firstItemName} 외 ${state.items.length - 1}건`
        : firstItemName

    const customerMobilePhone = String(state.tel || '').replace(/\D/g, '')

    const successUrl = `${window.location.origin}/payment/success`
const failUrl = `${window.location.origin}/payment/fail`

console.log('Toss 결제 요청 정보:', {
  orderId,
  orderName,
  successUrl,
  failUrl,
  amount: paymentAmount,
})

// 4. Toss 결제창 호출
await widgets.requestPayment({
  orderId,
  orderName,
  successUrl,
  failUrl,
  customerMobilePhone,
})

  } catch (e) {
    console.error('결제 요청 실패:', e)
    await showAlert('결제 요청에 실패했습니다.', { title: '결제 오류', type: 'error' })
  } finally {
    isOrdering.value = false
  }
}
</script>

<!-- template, style 변경 있음 -->
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
              :value="`${state.address} ${state.addressDetail}`"
              readonly
              class="input-field"
            />
            <button class="change-btn" type="button">변경</button>
          </div>
        </div>

        <div class="info-group">
          <div class="section-label">휴대폰 번호</div>
          <div class="input-row">
            <input :value="state.tel" readonly class="input-field" />
            <button class="change-btn" type="button">변경</button>
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
          <div class="section-label">쿠폰 선택</div>
          <select
            v-model="state.selectedCouponListId"
            class="input-field full"
            :disabled="state.couponLoading || state.coupons.length === 0 || isOrdering"
          >
            <option value="">쿠폰 사용 안 함</option>
            <option
              v-for="coupon in state.coupons"
              :key="coupon.couponListId"
              :value="coupon.couponListId"
            >
              {{ coupon.name }} - {{ formatCouponDiscount(coupon) }}
            </option>
          </select>

          <p v-if="!state.couponLoading && state.coupons.length === 0" class="coupon-empty">
            사용 가능한 쿠폰이 없습니다.
          </p>
          <p v-if="selectedCoupon" class="coupon-info">
            {{ selectedCoupon.expiry }}까지 사용 가능
          </p>
        </div>

        <div
          class="eco-card"
          :class="{ active: state.ecoSelected }"
          @click="state.ecoSelected = !state.ecoSelected"
        >
          <div class="eco-content">
            <div class="eco-checkbox-row">
              <div class="eco-checkbox" :class="{ checked: state.ecoSelected }">
                <span v-if="state.ecoSelected">✓</span>
              </div>
              <span class="eco-title">일회용 수저, 포크 안 주셔도 돼요 🌱</span>
            </div>
            <p class="eco-desc">
              주변에 사용할 수 있는 식기류가 있다면<br>
              일회용품 줄이기와 함께<br>
              내 <strong>친환경 점수</strong>를 높여보세요!
            </p>
          </div>
          <div class="eco-icon">🌍</div>
        </div>

        <div class="price-box">
          <div class="price-row">
            <span>메뉴 금액</span>
            <span>{{ formatPrice(state.menuTotal) }}</span>
          </div>
          <div class="price-row">
            <span>배달팁</span>
            <span>{{ formatPrice(state.deliveryFee) }}</span>
          </div>
          <div v-if="discountAmount > 0" class="price-row discount">
            <span>쿠폰 할인</span>
            <span>-{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="price-row total">
            <span>총 결제 금액</span>
            <span class="total-price">{{ formatPrice(displayTotalAmount) }}</span>
          </div>
        </div>

        <button
          class="order-btn"
          type="button"
          @click="handleOrder"
          :disabled="!isWidgetReady || isOrdering"
        >
          {{ isWidgetReady ? `${formatPrice(displayTotalAmount)} 결제하기` : '로딩 중...' }}
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

.coupon-empty,
.coupon-info {
  margin: 8px 0 0;
  font-size: 0.82rem;
  color: #888;
}

.coupon-info {
  color: #a40c0b;
}

.eco-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0faf0;
  border: 1.5px solid #c8e6c9;
  border-radius: 12px;
  padding: 16px;
  margin: 0 0 20px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s, border-color 0.2s;
}

.eco-card.active {
  background: #e8f5e9;
  border-color: #4caf50;
}

.eco-content { flex: 1; }

.eco-checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.eco-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  color: white;
  background: #fff;
  flex-shrink: 0;
  transition: all 0.2s;
}

.eco-checkbox.checked {
  background: #43a047;
  border-color: #43a047;
}

.eco-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1b5e20;
}

.eco-desc {
  font-size: 0.8rem;
  color: #388e3c;
  line-height: 1.6;
  margin: 0 0 0 30px;
}

.eco-icon {
  font-size: 2.5rem;
  margin-left: 12px;
  flex-shrink: 0;
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

.price-row.discount {
  color: #a40c0b;
  font-weight: 700;
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
