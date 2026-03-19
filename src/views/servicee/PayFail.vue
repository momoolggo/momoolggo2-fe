<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import orderService from '@/services/orderService';

const router = useRouter();
const state = reactive({ code: '', message: '' });

onMounted(async() => {
    const params = new URLSearchParams(window.location.search);
    state.code    = params.get('code') ?? '알 수 없는 오류';
    state.message = params.get('message') ?? '결제에 실패했습니다.';
    await orderService.deleteOrder(params.get('orderId'));
});
</script>

<template>
  <div class="result-page">
    <h2>결제 실패</h2>
    <p>에러코드: {{ state.code }}</p>
    <p>실패 사유: {{ state.message }}</p>
    <button @click="router.back()">다시 시도하기</button>
  </div>
</template>

<style scoped>
.result-page { text-align: center; margin-top: 100px; }
button { margin-top: 20px; padding: 10px 24px; background: #4A90E2; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
</style>
