<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'  // ✅ 추가
import cartService from '@/services/cartService'   // ✅ 추가

const props = defineProps({
  menu: Object,
  isOpen: Boolean,
})

const emit = defineEmits(['close', 'add-to-cart'])
const authStore = useAuthStore()  // ✅ 추가
const quantity = ref(1)

const updateQuantity = (val) => {
  if (quantity.value + val < 1) return
  quantity.value += val
}

//장바구니 담기
const handleAddCart = async () => {
  try {
    const cartData = {
      userNo: authStore.state.userNo,
      menuId: props.menu.menuId,
      quantity: quantity.value,
    }

    const res = await cartService.addToCart(cartData)

    alert('장바구니에 담겼습니다! 🛒')
    quantity.value = 1
    emit('close')

  } catch (error) {
    // 409: 다른 매장 메뉴 존재
    if (error.response?.status === 409) {
      const confirmed = confirm('다른 매장의 메뉴가 장바구니에 있습니다.\n기존 장바구니를 비우고 담을까요?')

      if (confirmed) {
        await cartService.clearAndAdd({
          userNo: authStore.state.userNo,
          menuId: props.menu.menuId,
          quantity: quantity.value,
        })
        alert('장바구니에 담겼습니다! 🛒')
        quantity.value = 1
        emit('close')
      }
    } else {
      alert('장바구니 담기에 실패했습니다.')
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
        <img :src="menu.pic || '/images/default-menu.png'" alt="메뉴 이미지" />
      </div>

      <div class="info-area">
        <h2 class="menu-name">{{ menu.name }}</h2>
        <p class="menu-desc">{{ menu.desc }}</p>
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
        <p class="min-price-info">배달 최소주문금액 15,000원</p>
        <button class="add-cart-btn" @click="handleAddCart">장바구니 담기</button>
      </div>
    </div>
  </div>
</template>



<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  width: 90%;
  max-width: 450px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}
.modal-header {
  position: absolute;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 15px;
  z-index: 10;
}
.modal-header button {
  background: white;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.image-area img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.info-area {
  padding: 20px;
  border-bottom: 1px solid #eee;
}
.menu-name {
  font-size: 1.4rem;
  margin-bottom: 10px;
}
.menu-desc {
  font-size: 0.9rem;
  color: #777;
  line-height: 1.5;
  margin-bottom: 20px;
}
.price-row {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.footer-area {
  padding: 20px;
}
.quantity-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.counter {
  border: 1px solid #ddd;
  border-radius: 5px;
  display: flex;
  align-items: center;
}
.counter button {
  padding: 5px 15px;
  border: none;
  background: none;
  font-size: 1.2rem;
  cursor: pointer;
}
.counter span {
  padding: 0 10px;
}

.min-price-info {
  text-align: center;
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 10px;
}
.add-cart-btn {
  width: 100%;
  padding: 15px;
  background: #2ac1bc;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
}
</style>
