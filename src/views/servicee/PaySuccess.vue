<script setup>
import { onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import orderService from '@/services/orderService'
import { showAlert } from '@/composables/useAlert'

const route = useRoute()
const router = useRouter()

const state = reactive({
    paymentKey: '',
    orderId: '',
    amount: 0,
    loading: true,
    errorCode: '',
    errorMessage: '',
})

onMounted(async () => {
  // 1. Toss 결제 성공 후 successUrl 뒤에 자동으로 붙는 query 파라미터 조회
    state.paymentKey = route.query.paymentKey || ''
    state.orderId = route.query.orderId || ''
    state.amount = Number(route.query.amount || 0)

    console.log('결제 성공 파라미터:', {
    paymentKey: state.paymentKey,
    orderId: state.orderId,
    amount: state.amount,
    payState: 2,
    })

  // 2. 결제 승인에 필요한 값이 없으면 승인 요청을 보내지 않고 실패 화면으로 이동
if (!state.paymentKey || !state.orderId || !state.amount) {
    state.loading = false
    state.errorCode = 'MISSING_PAYMENT_PARAMS'
    state.errorMessage = '결제 승인 정보가 없습니다.'

    await showAlert('결제 승인 정보가 없습니다. 다시 시도해주세요.', {
        title: '결제 승인 오류',
        type: 'error',
    })

    router.push(
        `/payment/fail?code=${state.errorCode}&message=${encodeURIComponent(state.errorMessage)}`
    )
    return
    }

    try {
    // 3. 서버에 결제 승인 요청
    // 백엔드 /payment/confirm 요청 필드:
    // paymentKey, orderId, amount, payState
    const result = await orderService.confirmPayment({
        paymentKey: state.paymentKey,
        orderId: String(state.orderId),
        amount: state.amount,
        payState: 2,
    })

    console.log('결제 승인 성공 응답:', result)

    await showAlert('주문이 완료되었습니다.', {
        title: '주문 완료',
        type: 'success',
    })

    // 4. 결제 승인 성공 후 주문내역으로 이동
    router.push('/mypage/orders')
    } catch (e) {
    // 5. 서버 결제 승인 실패 처리
    console.error('결제 승인 실패:', e)
    console.log('에러 전체:', e)
    console.log('에러 응답:', e.response?.data)
    console.log('에러 상태코드:', e.response?.status)

    const code = e.response?.data?.code || e.code || 'PAYMENT_CONFIRM_FAILED'
    const message =
        e.response?.data?.resultMessage ||
        e.response?.data?.message ||
        e.message ||
        '결제 승인에 실패했습니다.'

    router.push(
        `/payment/fail?code=${code}&message=${encodeURIComponent(message)}&orderId=${state.orderId}`
    )
    } finally {
    state.loading = false
    }
})
</script>

<template>
    <div class="result-page">
    <h2>결제 처리 중...</h2>
    <p>잠시만 기다려 주세요.</p>
    </div>
</template>

<style scoped>
.result-page {
    text-align: center;
    margin-top: 100px;
}
</style>
