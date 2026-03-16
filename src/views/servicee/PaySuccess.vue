<script setup>
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import orderService from '@/services/orderService';

const router = useRouter();
const state = reactive({ paymentKey: '', orderId: '', amount: '' });

onMounted(async () => {
    const params = new URLSearchParams(window.location.search);
    state.paymentKey = params.get('paymentKey');
    state.orderId    = params.get('orderId');
    state.amount     = params.get('amount');

    try {
        // ✅ 서버에 결제 승인 요청 (백엔드 /confirm 엔드포인트 필요)
        await orderService.confirmPayment({
            paymentKey: state.paymentKey,
            orderId:    state.orderId,
            amount:     state.amount,
        });
        alert('주문이 완료되었습니다! 🎉');
        router.push('/');
    } catch (e) {
        console.error('결제 승인 실패:', e);
        router.push(`/payment/fail?message=${e.message}&code=${e.code}`);
    }
});
</script>

<template>
  <div class="result-page">
    <h2>결제 처리 중...</h2>
    <p>잠시만 기다려 주세요.</p>
  </div>
</template>

<style scoped>
.result-page { text-align: center; margin-top: 100px; }
</style>
