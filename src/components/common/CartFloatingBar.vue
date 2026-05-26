<script setup>
// 2026-05-25 9건 트랙 #1 — 장바구니에 항목이 있으면 customer 전역에 floating "주문하러 가기" 바 노출.
// CartView 진입 없이도 어디서든 장바구니 진입 가능.
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

// 표시 제외 경로 — 장바구니/주문/결제 자체 페이지에서는 floating 불필요
const hiddenPaths = ['/cart', '/order', '/payment/success', '/payment/fail']

const visible = computed(() =>
  userStore.state.isSignedIn
  && userStore.state.role === 'CUSTOMER'
  && cartStore.cartCount > 0
  && !hiddenPaths.includes(route.path)
)

const goCart = () => router.push('/cart')
</script>

<template>
  <transition name="slide-up">
    <button v-if="visible" class="floating-cart-bar" @click="goCart">
      <span class="cart-icon">🛒</span>
      <span class="text">장바구니 {{ cartStore.cartCount }}건 · 주문하러 가기</span>
      <span class="arrow">›</span>
    </button>
  </transition>
</template>

<style scoped>
/* 2026-05-25 9건 트랙 정정 — CartView .order-btn 동일 스타일 (파랑 #4A90E2) */
.floating-cart-bar {
  position: fixed;
  bottom: calc(80px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  z-index: 998;
  width: calc(100% - 32px);
  max-width: 448px;
  padding: 18px;
  background: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.35);
  transition: transform 0.15s;
}
.floating-cart-bar:active { transform: translateX(-50%) scale(0.98); }
.cart-icon { font-size: 18px; }
.text { text-align: center; }
.arrow { font-size: 22px; opacity: 0.85; font-weight: 400; }

.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.2s ease, transform 0.25s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
