<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import cartService from '@/services/cartService'
import { showAlert, showConfirm } from '@/composables/useAlert'

const props = defineProps({
  menu: Object,
  isOpen: Boolean,
  minPrice: { type: Number, default: 0 },
})

const emit = defineEmits(['close', 'add-to-cart'])
const userStore = useUserStore()
const quantity = ref(1)

const getImageUrl = (path) => {
  if (!path) return '/images/default-menu.png'
  if (path.startsWith('data:')) return path      // ← Base64 data URI 지원 추가
  if (path.startsWith('http') || path.startsWith('blob')) return path
  return `${path}`
}

const updateQuantity = (val) => {
  if (quantity.value + val < 1) return
  quantity.value += val
}

const handleAddCart = async () => {
  try {
    const cartData = {
      userNo: userStore.state.userNo,
      menuId: props.menu.menuId,
      quantity: quantity.value,
    }
    await cartService.addToCart(cartData)
    await showAlert('장바구니에 담겼습니다! 🛒', { title: '장바구니', type: 'success' })
    quantity.value = 1
    emit('close')
  } catch (error) {
    if (error.response?.status === 409) {
      const confirmed = await showConfirm('다른 매장의 메뉴가 장바구니에 있습니다.\n기존 장바구니를 비우고 담을까요?', { title: '장바구니 초기화', type: 'warning' })
      if (confirmed) {
        await cartService.clearAndAdd({
          userNo: userStore.state.userNo,
          menuId: props.menu.menuId,
          quantity: quantity.value,
        })
        await showAlert('장바구니에 담겼습니다! 🛒', { title: '장바구니', type: 'success' })
        quantity.value = 1
        emit('close')
      }
    } else {
      await showAlert('장바구니 담기에 실패했습니다.', { title: '오류', type: 'error' })
    }
  }
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <button class="back-btn" @click="$emit('close')">⬅</button>
        <button class="cart-btn">🛒</button>
      </div>

      <div class="image-area">
        <img :src="getImageUrl(menu.menuPic)" alt="메뉴 이미지" />
      </div>

      <div class="info-area">
        <h2 class="menu-name">{{ menu.menuName }}</h2>
        <p class="menu-desc">{{ menu.menuInfo }}</p>
        <div class="price-row">
          <span class="price">{{ menu.price?.toLocaleString() }}원</span>
        </div>
      </div>

      <div class="footer-area">
        <div class="quantity-control">
          <span class="label">수량</span>
          <div class="counter">
            <button @click="updateQuantity(-1)">-</button>
            <span>{{ quantity }}개</span>
            <button @click="updateQuantity(1)">+</button>
          </div>
        </div>
        <p class="min-price-info">배달 최소주문금액 {{ (minPrice || 0).toLocaleString() }}원</p>
        <button class="add-cart-btn" @click="handleAddCart">장바구니 담기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { width: 90%; max-width: 450px; background: white; border-radius: 20px; overflow: hidden; position: relative; }
.modal-header { position: absolute; top: 0; width: 100%; display: flex; justify-content: space-between; padding: 15px; z-index: 10; }
.modal-header button { background: white; border-radius: 50%; width: 35px; height: 35px; border: none; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); cursor: pointer; }
.image-area img { width: 100%; height: 250px; object-fit: cover; }
.info-area { padding: 20px; border-bottom: 1px solid #eee; }
.menu-name { font-size: 1.4rem; margin-bottom: 10px; }
.menu-desc { font-size: 0.9rem; color: #777; line-height: 1.5; margin-bottom: 20px; }
.price-row { display: flex; justify-content: space-between; font-weight: bold; }
.footer-area { padding: 20px; }
.quantity-control { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.counter { border: 1px solid #ddd; border-radius: 5px; display: flex; align-items: center; }
.counter button { padding: 5px 15px; border: none; background: none; font-size: 1.2rem; cursor: pointer; }
.counter span { padding: 0 10px; }
.min-price-info { text-align: center; font-size: 0.8rem; color: #999; margin-bottom: 10px; }
.add-cart-btn { width: 100%; padding: 15px; background: #2e55e0; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; }
</style>