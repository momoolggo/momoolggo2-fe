<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import cartService from '@/services/cartService';  // ✅ storeService → cartService
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();
const user = computed(() => userStore.state);
const userNo = computed(() => userStore.state.userNo); // ✅ userNo 추가

const state = reactive({
    storeName: '',
    storeId: null,
    cartItems: [],
    deliveryTip: 1500,
    loading: true,
});

// --- 디바운싱 타이머 저장소 ---
const debounceTimers = {};

const loadCart = async () => {
    try {
        const res = await cartService.getCartList(userNo.value); // ✅ 수정
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
        // 테스트용 가짜 데이터
        state.storeName = "스시세츠 - 동성로점";
        state.storeId = 3;
        state.cartItems = [
            { id: 1, menuName: "연어초밥 세트", price: 12000, quantity: 1, menuPic: "https://picsum.photos/100", checked: false },
            { id: 2, menuName: "참치초밥 세트", price: 15000, quantity: 2, menuPic: "https://picsum.photos/101", checked: false },
            { id: 3, menuName: "우동", price: 7000, quantity: 1, menuPic: "https://picsum.photos/102", checked: false }
        ];
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

// --- [수정] 디바운싱 적용된 수량 변경 ---
const changeQuantity = (item, delta) => {
    const next = item.quantity + delta;
    if (next < 1) return removeItem(item);

    // 1. UI 즉시 업데이트 (낙관적 업데이트)
    item.quantity = next;

    // 2. 디바운싱 로직
    if (debounceTimers[item.id]) clearTimeout(debounceTimers[item.id]);

    debounceTimers[item.id] = setTimeout(async () => {
        try {
            await cartService.updateCartItem(item.id, { quantity: item.quantity }); // ✅ 수정
        } catch (e) {
            console.error('수량 변경 실패:', e);
            alert('수량 변경에 실패했습니다. 다시 시도해주세요.');
            loadCart(); // 실패 시 서버 데이터로 롤백
        }
    }, 500);
};

// --- [수정] 단일 메뉴 삭제 (낙관적 업데이트) ---
const removeItem = async (item) => {
    if (!confirm(`${item.menuName} 메뉴를 삭제하시겠습니까?`)) return;

    const originalItems = [...state.cartItems]; // 롤백용 백업
    const idx = state.cartItems.indexOf(item);

    // 1. UI 선반영
    if (idx !== -1) state.cartItems.splice(idx, 1);

    // 2. API 호출
    try {
        await cartService.deleteCartItem(item.id); // ✅ 수정
        if (state.cartItems.length === 0) {
            state.storeName = '';
            state.storeId = null;
        }
    } catch (e) {
        console.error('삭제 실패:', e);
        state.cartItems = originalItems; // 실패 시 복구
        alert('삭제 요청에 실패했습니다.');
    }
};

const allChecked = computed(() =>
    state.cartItems.length > 0 && state.cartItems.every(i => i.checked)
);
const toggleAll = () => {
    const val = !allChecked.value;
    state.cartItems.forEach(i => i.checked = val);
};

// --- [수정] 선택 삭제 (낙관적 업데이트) ---
const deleteSelected = async () => {
    const selectedItems = state.cartItems.filter(i => i.checked);
    if (selectedItems.length === 0) return alert('선택된 메뉴가 없습니다.');
    if (!confirm('선택한 메뉴를 삭제하시겠습니까?')) return;

    const originalItems = [...state.cartItems];
    const selectedIds = selectedItems.map(i => i.id);

    // 1. UI 선반영
    state.cartItems = state.cartItems.filter(i => !i.checked);

    // 2. API 호출 (순차 혹은 병렬 처리)
    try {
        await Promise.all(selectedIds.map(id => cartService.deleteCartItem(id))); // ✅ 수정
        if (state.cartItems.length === 0) {
            state.storeName = '';
            state.storeId = null;
        }
    } catch (e) {
        console.error('선택 삭제 실패:', e);
        state.cartItems = originalItems;
        alert('일부 또는 전체 메뉴 삭제에 실패했습니다.');
    }
};

// --- [수정] 장바구니 비우기 (낙관적 업데이트) ---
const clearCart = async () => {
    if (!confirm('장바구니를 비우시겠습니까?')) return;

    const backup = {
        name: state.storeName,
        id: state.storeId,
        items: [...state.cartItems]
    };

    // 1. UI 선반영
    state.storeName = '';
    state.storeId = null;
    state.cartItems = [];

    // 2. API 호출
    try {
        await cartService.clearCart(userNo.value); // ✅ 수정
    } catch (e) {
        console.error('장바구니 비우기 실패:', e);
        state.storeName = backup.name;
        state.storeId = backup.id;
        state.cartItems = backup.items;
        alert('장바구니 비우기에 실패했습니다.');
    }
};

const goOrder = () => router.push('/order');
const goStore = () => state.storeId ? router.push(`/store/${state.storeId}`) : router.push('/storelist');
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
                  <div class="items-toolbar">
                      <button class="toolbar-btn" @click="toggleAll">
                          {{ allChecked ? '전체해제' : '전체선택' }}
                      </button>
                      <button class="toolbar-btn delete" @click="deleteSelected">선택삭제</button>
                  </div>

                  <div v-for="item in state.cartItems" :key="item.id" class="cart-item">
                      <img :src="item.menuPic || '/images/default-menu.png'" class="item-img" />

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

                      <input type="checkbox" v-model="item.checked" class="item-check" />
                  </div>
              </section>

              <section class="summary-card">
                  <div class="price-row">
                      <span class="label">메뉴 금액</span>
                      <span class="val">{{ menuTotal.toLocaleString() }}원</span>
                  </div>
                  <div class="price-details">
                      <div v-for="item in state.cartItems" :key="'detail-'+item.id" class="detail-line">
                          <span>{{ item.menuName }} x {{item.quantity}}</span>
                          <span>{{ (item.price * item.quantity).toLocaleString() }}원</span>
                      </div>
                  </div>

                  <div class="price-row">
                      <span class="label">배달팁</span>
                      <span class="val">{{ state.deliveryTip.toLocaleString() }}원</span>
                  </div>
                  <div class="price-row">
                      <span class="label">할인 쿠폰</span>
                      <span class="val">0원</span>
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
              <div class="empty-cart">
                  <span class="empty-icon">⚠️</span>
                  <p>담은 메뉴가 없습니다</p>
                  <button class="order-btn" @click="goStore">메뉴 담으러 가기</button>
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
  padding-bottom: 100px;
}

.cart-title {
  background: #fff;
  margin: 0;
  padding: 20px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 700;
  border-bottom: 1px solid #eee;
}

.cart-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* --- [수정] 매장 헤더 호버 효과 추가 --- */
.store-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content; /* 텍스트 길이에 맞춤 */
}

.store-header:hover {
  opacity: 0.7;
  transform: translateX(2px);
}

.store-name {
  font-weight: 800;
  font-size: 1.1rem;
  color: #111;
}

.arrow-icon {
  font-size: 0.8rem;
  color: #bbb;
}

/* 아이템 리스트 카드 */
.cart-items-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.items-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f5;
}

.toolbar-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.toolbar-btn.delete { color: #ff4d4f; }

.cart-item {
  position: relative;
  display: flex;
  padding: 20px 16px;
  gap: 12px;
  border-bottom: 1px solid #f8f9fa;
}

.item-img {
  width: 85px;
  height: 85px;
  border-radius: 12px;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name { font-weight: 700; font-size: 1rem; color: #222; }
.item-price { font-size: 0.9rem; color: #888; margin-bottom: 8px; }

.item-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-btn {
  padding: 6px 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #f8f9fa;
  font-size: 0.75rem;
  color: #666;
  cursor: pointer;
}

.quantity-ctrl {
  display: flex;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #fff;
}

.quantity-ctrl button {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: bold;
}

.quantity-ctrl span {
  width: 30px;
  text-align: center;
  line-height: 28px;
  font-size: 0.85rem;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
}

.item-check {
  position: absolute;
  top: 20px;
  right: 16px;
  width: 22px;
  height: 22px;
  accent-color: #4A90E2;
  cursor: pointer;
}

/* 금액 상세 카드 */
.summary-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 15px;
  padding: 20px 16px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.price-details {
  padding: 0 0 12px 0;
  border-bottom: 1px solid #f1f3f5;
  margin-bottom: 12px;
}

.detail-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 6px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
}

.total-label { font-size: 1.1rem; font-weight: 800; }
.total-val { font-size: 1.3rem; font-weight: 800; color: #4A90E2; }

/* --- [수정] 하단 버튼 구역: 비우기 버튼 디자인 강화 --- */
.action-area {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-btn {
  width: 100%;
  padding: 18px;
  background: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
}

.order-btn:active {
  background: #357ABD;
}

.clear-btn-box {
  width: 100%;
  padding: 14px;
  background: #fff;
  color: #ff4d4f;
  border: 1px solid #ff4d4f; /* 테두리를 주어 버튼임을 강조 */
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn-box:hover {
  background: #fff1f0;
}

.empty-cart {
  text-align: center;
  padding: 100px 0;
}
</style>
