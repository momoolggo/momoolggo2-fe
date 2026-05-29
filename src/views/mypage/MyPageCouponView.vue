<script setup>
import { computed, onMounted, reactive } from 'vue'
import orderService from '@/services/orderService'

const state = reactive({
  coupons: [],
  loading: true,
  errorMessage: '',
  code: 'MMG-',
  registering: false,
  registerMessage: '',
})

const availableCount = computed(() => state.coupons.length)
const isCouponCodeValid = computed(() => /^MMG-[A-Z0-9]{6}$/.test(state.code.trim()))

const formatPrice = value => `${Number(value || 0).toLocaleString()}원`

const updateCouponCode = event => {
  const value = event.target.value
    .toUpperCase()
    .replace(/^MMG-?/, '')
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6)
  state.code = `MMG-${value}`
}

const loadPendingRewardCode = () => {
  const code = sessionStorage.getItem('foodCupRewardCode') || ''
  if (/^MMG-[A-Z0-9]{6}$/.test(code)) {
    state.code = code
  }
}

const loadCoupons = async () => {
  state.loading = true
  state.errorMessage = ''

  try {
    const res = await orderService.getUserCoupons()
    state.coupons = res.resultData || []
  } catch (e) {
    console.error('쿠폰 목록 조회 실패:', e)
    state.errorMessage = '쿠폰 목록을 불러오지 못했습니다.'
    state.coupons = []
  } finally {
    state.loading = false
  }
}

const registerCouponCode = async () => {
  const code = state.code.trim()
  if (!isCouponCodeValid.value || state.registering) return

  state.registering = true
  state.registerMessage = ''

  try {
    await orderService.registerCouponCode(code)
    state.code = 'MMG-'
    sessionStorage.removeItem('foodCupRewardCode')
    state.registerMessage = '쿠폰 등록 완료'
    await loadCoupons()
  } catch (e) {
    console.error('coupon code register failed:', e)
    state.registerMessage = e.response?.data?.resultMessage || '쿠폰 등록에 실패했습니다.'
  } finally {
    state.registering = false
  }
}

onMounted(() => {
  loadPendingRewardCode()
  loadCoupons()
})
</script>

<template>
  <div class="coupon-page">
    <div class="page-header">
      <h2 class="page-title">쿠폰함</h2>
      <p class="page-subtitle">사용 가능한 쿠폰 {{ availableCount }}장</p>
    </div>

    <form class="coupon-register" @submit.prevent="registerCouponCode">
      <input
        v-model="state.code"
        class="coupon-code-input"
        type="text"
        placeholder="MMG-XXXXXX"
        maxlength="10"
        @input="updateCouponCode"
        :disabled="state.registering"
      />
      <button
        class="coupon-register-btn"
        type="submit"
        :disabled="state.registering || !isCouponCodeValid"
      >
        등록
      </button>
    </form>
    <p v-if="state.registerMessage" class="coupon-register-message">
      {{ state.registerMessage }}
    </p>

    <div v-if="state.loading" class="message-box">
      쿠폰을 불러오는 중입니다.
    </div>

    <div v-else-if="state.errorMessage" class="message-box error">
      {{ state.errorMessage }}
    </div>

    <div v-else-if="state.coupons.length === 0" class="message-box">
      보유한 쿠폰이 없습니다.
    </div>

    <div v-else class="coupon-list">
      <div
        v-for="coupon in state.coupons"
        :key="coupon.couponListId"
        class="coupon-card"
      >
        <div class="coupon-main">
          <div class="coupon-name">{{ coupon.name }}</div>
          <div class="coupon-discount">{{ formatPrice(coupon.discount) }} 할인</div>
        </div>

        <div class="coupon-footer">
          <span>만료일</span>
          <strong>{{ coupon.expiry }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coupon-page {
  max-width: 480px;
  margin: 40px auto;
  padding: 0 16px 100px;
  box-sizing: border-box;
}
.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 8px;
}
.page-subtitle {
  margin: 0;
  color: #777;
  font-size: 14px;
}
.coupon-register {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.coupon-code-input {
  flex: 1;
  min-width: 0;
  padding: 12px;
  border: 1.5px solid #e5e3dc;
  border-radius: 8px;
  font-size: 14px;
  text-transform: uppercase;
}
.coupon-register-btn {
  flex-shrink: 0;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  background: #a40c0b;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
.coupon-register-btn:disabled {
  background: #ccc;
  cursor: default;
}
.coupon-register-message {
  margin: 0 0 18px;
  color: #a40c0b;
  font-size: 13px;
}
.message-box {
  padding: 80px 0;
  text-align: center;
  color: #777;
  font-size: 15px;
}
.message-box.error {
  color: #a40c0b;
}
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.coupon-card {
  position: relative;
  overflow: hidden;
  background: #fff;
  border: 1.5px solid #e5e3dc;
  border-radius: 12px;
  padding: 20px;
}
.coupon-card::before,
.coupon-card::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  background: #f8f8f8;
  border: 1.5px solid #e5e3dc;
  border-radius: 50%;
  transform: translateY(-50%);
}
.coupon-card::before {
  left: -10px;
}
.coupon-card::after {
  right: -10px;
}
.coupon-main {
  padding-bottom: 18px;
  border-bottom: 1px dashed #ddd;
}
.coupon-name {
  color: #222;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
}
.coupon-discount {
  color: #a40c0b;
  font-size: 24px;
  font-weight: 900;
}
.coupon-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  color: #777;
  font-size: 13px;
}
.coupon-footer strong {
  color: #333;
  font-weight: 700;
}
</style>