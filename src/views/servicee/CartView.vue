<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import cartService from '@/services/cartService';
import { useUserStore } from '@/stores/userStore';
import { showAlert, showConfirm } from '@/composables/useAlert'

const router = useRouter();
const userStore = useUserStore();
const userNo = computed(() => userStore.state.userNo);

const state = reactive({
    storeName: '',
    storeId: null,
    cartItems: [],
    deliveryTip: 1500,
    loading: true,
});

const debounceTimers = {};

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('data:')) return path      // ← Base64 data URI 지원 추가
  if (path.startsWith('http') || path.startsWith('blob')) return path
  return `${path}`
}

const loadCart = async () => {
    try {
        const res = await cartService.getCartList(userNo.value);
        const data = res.resultData;

        if (!data || !data.items || data.items.length === 0) {
            state.storeName = '';
            state.storeId = null;
            state.cartItems = [];
            return;
        }

        state.storeName = data.storeName || '';
        state.storeId = data.storeId || null;
        state.cartItems = (data.items || []).map(i => ({ ...i, checked: false }));
    } catch (e) {
        console.error('장바구니 로드 실패:', e);
        // 테스트용 데이터 (필요 시 삭제)
        state.storeName = "코이보타루";
        state.storeId = 1;
        state.cartItems = [];
    } finally {
        state.loading = false;
    }
};

onMounted(loadCart);

const menuTotal = computed(() =>
    state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
const totalPrice = computed(() =>
    state.cartItems.length > 0 ? menuTotal.value + state.deliveryTip : 0
);

const changeQuantity = (item, delta) => {
    const next = item.quantity + delta;
    if (next < 1) return removeItem(item);
    item.quantity = next;

    if (debounceTimers[item.id]) clearTimeout(debounceTimers[item.id]);
    debounceTimers[item.id] = setTimeout(async () => {
        try {
            await cartService.updateCartItem(item.id, { quantity: item.quantity });
        } catch (e) {
            loadCart();
        }
    }, 500);
};

const removeItem = async (item) => {
    const ok = await showConfirm(`${item.menuName} 메뉴를 삭제하시겠습니까?`, { title: '메뉴 삭제', type: 'warning' })
    if (!ok) return
    try {
        await cartService.deleteCartItem(item.id);
        loadCart();
    } catch (e) {
        await showAlert('삭제에 실패했습니다.', { title: '오류', type: 'error' })
    }
};

const clearCart = async () => {
    // 변경
    const ok = await showConfirm('장바구니를 완전히 비우시겠습니까?', { title: '장바구니 비우기', type: 'warning' })
    if (!ok) return
    try {
        await cartService.clearCart(userNo.value);
        state.cartItems = [];
        state.storeName = '';
    } catch (e) {
        await showAlert('초기화에 실패했습니다.', { title: '오류', type: 'error' })
    }
};

const goOrder = () => router.push('/order');
const goStore = () => state.storeId ? router.push(`/store/${state.storeId}`) : router.push('/home');
</script>

<template>
  <div class="cart-page">
    <h2 class="cart-title">장바구니</h2>

    <div class="cart-container">
      <template v-if="state.cartItems.length > 0">
        <div class="store-header" @click="goStore">
          <span class="store-icon">🍱</span>
          <span class="store-name">{{ state.storeName }}</span>
          <span class="arrow-icon">❯</span>
        </div>

        <section class="cart-items-card">
          <div v-for="item in state.cartItems" :key="item.id" class="cart-item">
            <img :src="getImageUrl(item.menuPic) || '/images/default-menu.png'" class="item-img" />
            <div class="item-info">
              <div class="item-name">{{ item.menuName }}</div>
              <div class="item-price">가격: {{ item.price.toLocaleString() }}원</div>
              <div class="item-controls">
                <button class="option-btn">옵션변경</button>
                <div class="quantity-ctrl">
                  <button @click="changeQuantity(item, -1)">−</button>
                  <span>{{ item.quantity }}</span>
                  <button @click="changeQuantity(item, +1)">+</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="summary-card">
          <div class="price-row">
            <span>메뉴 금액</span>
            <span>{{ menuTotal.toLocaleString() }}원</span>
          </div>
          <div class="price-row">
            <span>배달팁</span>
            <span>{{ state.deliveryTip.toLocaleString() }}원</span>
          </div>
          <div class="total-row">
            <span class="total-label">총 결제 금액</span>
            <span class="total-val">{{ totalPrice.toLocaleString() }}원</span>
          </div>
        </section>

        <div class="action-area">
          <button class="order-btn" @click="goOrder">주문하기</button>
          <button class="clear-btn-box" @click="clearCart">장바구니 전체 비우기</button>
        </div>
      </template>

      <template v-else>
        <div class="empty-cart-wrapper">
          <div class="empty-content">
            <div class="empty-icon-circle">
              <span class="empty-emoji">⚠</span>
            </div>
            <h3 class="empty-main-text">담은 메뉴가 없습니다</h3>
            <p class="empty-sub-text">코이보타루의 맛있는 메뉴를 구경해보세요!</p>
            <button class="go-shopping-btn" @click="goStore">
              메뉴 담으러 가기
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  width: 100%;
  background: #f8f9fa;
  min-height: 100vh;
  max-width: 480px;
  padding-bottom: 100px;
  margin: 0 auto;
}

.cart-title {
  background: #fff;
  padding: 20px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 700;
  border-bottom: 1px solid #eee;
  margin: 0;
}

.cart-container {
  padding: 16px;
}

/* 매장 헤더 호버 효과 */
.store-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 4px;
  cursor: pointer;
  transition: transform 0.2s;
  width: fit-content;
}
.store-header:hover { transform: translateX(4px); opacity: 0.8; }
.store-name { font-weight: 800; font-size: 1.1rem; }
.arrow-icon { font-size: 0.8rem; color: #ccc; }

/* 장바구니 아이템 카드 */
.cart-items-card {
  background: #fff;
  border-radius: 15px;
  border: 1px solid #eee;
  margin-bottom: 16px;
}
.cart-item {
  display: flex;
  padding: 16px;
  gap: 12px;
  border-bottom: 1px solid #f9f9f9;
}
.item-img { width: 80px; height: 80px; border-radius: 10px; object-fit: cover; }
.item-info { flex: 1; }
.item-name { font-weight: 700; margin-bottom: 4px; }
.item-price { color: #888; font-size: 0.9rem; margin-bottom: 8px; }

.item-controls { display: flex; gap: 8px; }
.option-btn { padding: 4px 10px; border: 1px solid #eee; background: #fdfdfd; border-radius: 5px; font-size: 0.8rem; }
.quantity-ctrl { display: flex; border: 1px solid #eee; border-radius: 5px; }
.quantity-ctrl button { width: 25px; border: none; background: none; cursor: pointer; }
.quantity-ctrl span { width: 30px; text-align: center; font-size: 0.9rem; line-height: 25px; border-left: 1px solid #eee; border-right: 1px solid #eee; }

/* 결제 정보 */
.summary-card {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  border: 1px solid #eee;
  margin-bottom: 20px;
}
.price-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #666; }
.total-row { display: flex; justify-content: space-between; padding-top: 15px; border-top: 2px solid #f5f5f5; margin-top: 10px; }
.total-label { font-weight: 800; font-size: 1.1rem; }
.total-val { font-weight: 800; font-size: 1.2rem; color: #222; }

/* 하단 버튼 */
.action-area { display: flex; flex-direction: column; gap: 12px; }
.order-btn { width: 100%; padding: 18px; background: #4A90E2; color: #fff; border: none; border-radius: 12px; font-size: 1.1rem; font-weight: 700; cursor: pointer; }
.clear-btn-box { width: 100%; padding: 14px; background: #fff; color:#a40C0b; border: 1px solid#a40C0b; border-radius: 12px; font-weight: 600; cursor: pointer; }

/* --- [수정] 비어있는 장바구니 스타일 (큼지막하게) --- */
.empty-cart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 65vh; /* 중앙 배치를 위해 높이 확보 */
}
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-icon-circle {
  width: 100px;
  height: 100px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  margin-bottom: 24px;
}
.empty-emoji { font-size: 3rem; }
.empty-main-text { font-size: 1.5rem; font-weight: 800; color: #333; margin-bottom: 8px; }
.empty-sub-text { font-size: 1rem; color: #999; margin-bottom: 30px; }
.go-shopping-btn {
  padding: 15px 60px;
  background: #ffffff;
  color:#a40C0b;
  border: none;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(228, 228, 228, 0.3);
}
</style>
