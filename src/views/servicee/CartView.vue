<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import storeService from '@/services/storeService';

const router = useRouter();

const state = reactive({
    storeName: '',
    storeId: null,
    cartItems: [],
    deliveryTip: 1500,
    loading: true,
});
const loadCart = async () => {//가짜데이터
    state.storeName = "스시세츠 - 동성로점";
    state.storeId = 3;
    state.cartItems = [
        {
            id: 1,
            menuName: "연어초밥 세트",
            price: 12000,
            quantity: 1,
            menuPic: "https://picsum.photos/100",
            checked: false
        },
        {
            id: 2,
            menuName: "참치초밥 세트",
            price: 15000,
            quantity: 2,
            menuPic: "https://picsum.photos/101",
            checked: false
        },
        {
            id: 3,
            menuName: "우동",
            price: 7000,
            quantity: 1,
            menuPic: "https://picsum.photos/102",
            checked: false
        }
    ];
};
// const loadCart = async () => { //장바구니 목록 가져오기
//     try {
//         const res = await storeService.getCart();
//         const data = res.resultData;
//         state.storeName = data.storeName || '';
//         state.storeId = data.storeId || null;
//         state.cartItems = (data.items || []).map(i => ({ ...i, checked: false }));
//     } catch (e) {
//         console.error('장바구니 로드 실패:', e);
//         state.cartItems = [];
//     } finally {
//     }
// };
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
};

const removeItem = (item) => {
    const idx = state.cartItems.indexOf(item);
    if (idx !== -1) state.cartItems.splice(idx, 1);
};

const allChecked = computed(() =>
    state.cartItems.length > 0 && state.cartItems.every(i => i.checked)
);
const toggleAll = () => {
    const val = !allChecked.value;
    state.cartItems.forEach(i => i.checked = val);
};
const deleteSelected = () => {
    state.cartItems = state.cartItems.filter(i => !i.checked);
};
const clearCart = () => {//장바구니 비우기
//장바구니 삭제하는 api만들어야됨
    state.storeName = '';
    state.storeId = null;
    state.cartItems = [];
};

const goOrder = () => router.push('/order');
const goStore = () => state.storeId ? router.push(`/store/${state.storeId}`) : router.push('/storelist');
</script>

<template>
<div class="cart-page">
    <h2 class="cart-title">장바구니</h2>

    <div class="cart-layout">

        <!-- 왼쪽: 요약 패널 -->
        <aside class="summary-panel">
            <template v-if="state.cartItems.length > 0">
                <div class="store-badge" @click="goStore" style="cursor: pointer;">
                    <span class="store-icon">🏪</span>
                    <span class="store-name">{{ state.storeName }}</span>
                </div>

                <div class="price-section">
                    <div class="section-label">메뉴 금액</div>
                    <div class="price-breakdown">
                        <div v-for="item in state.cartItems" :key="item.id" class="breakdown-row">
                            <span class="breakdown-name">{{ item.menuName }}</span>
                            <span class="breakdown-val">{{ (item.price * item.quantity).toLocaleString() }}원</span>
                        </div>
                    </div>
                    <div class="breakdown-total">
                        <span>합계</span>
                        <span>{{ menuTotal.toLocaleString() }}원</span>
                    </div>
                </div>

                <div class="price-section">
                    <div class="price-row">
                        <span class="section-label">배달팁</span>
                        <span class="price-val">{{ state.deliveryTip.toLocaleString() }}원</span>
                    </div>
                </div>

                <div class="total-section">
                    <span class="total-label">총 결제 금액</span>
                    <span class="total-val">{{ totalPrice.toLocaleString() }}원</span>
                </div>

                <button class="order-btn" @click="goOrder">주문하기</button>
                <button class="clear-btn" @click="clearCart">장바구니 비우기</button>
            </template>

            <template v-else>
                <div class="store-badge" @click="goStore" style="cursor: pointer;">
                    <span class="store-icon">🔎</span>
                    <span class="store-name">가게를 둘러보세요</span>
                </div>

                <div class="price-section">
                    <div class="price-row">
                        <span class="section-label">메뉴 금액</span>
                        <span class="price-val">0원</span>
                    </div>
                </div>
                <div class="price-section">
                    <div class="price-row">
                        <span class="section-label">배달팁</span>
                        <span class="price-val">0원</span>
                    </div>
                </div>

                <div class="total-section">
                    <span class="total-label">총 결제 금액</span>
                    <span class="total-val">0원</span>
                </div>

                <button class="order-btn secondary" @click="goStore">주문 하러 가기</button>
            </template>
        </aside>

        <!-- 오른쪽: 메뉴 리스트 -->
        <section class="cart-items-panel">
            <template v-if="state.cartItems.length > 0">
                <div class="items-toolbar">
                    <button class="toolbar-btn select-all" @click="toggleAll">
                        {{ allChecked ? '전체해제' : '전체선택' }}
                    </button>
                    <button class="toolbar-btn delete-selected" @click="deleteSelected">선택삭제</button>
                </div>

                <div class="item-list">
                    <div v-for="item in state.cartItems" :key="item.id" class="cart-item">
                        <input type="checkbox" v-model="item.checked" class="item-check" />

                        <div class="item-info">
                            <div class="item-name">{{ item.menuName }}</div>
                            <div class="item-price">가격: {{ item.price.toLocaleString() }}원</div>
                            <button class="option-btn">옵션변경</button>
                            <div class="quantity-ctrl">
                                <button @click="changeQuantity(item, -1)">−</button>
                                <span>{{ item.quantity }}</span>
                                <button @click="changeQuantity(item, +1)">+</button>
                            </div>
                        </div>

                        <img
                            :src="item.menuPic || '/images/default-menu.png'"
                            class="item-img"
                            :alt="item.menuName"
                        />
                    </div>
                </div>
            </template>

            <template v-else>
                <div class="empty-cart">
                    <span class="empty-icon">⚠️</span>
                    <p>담은 메뉴가 없습니다</p>
                </div>
            </template>
        </section>

    </div>
</div>
</template>

<style scoped>
.cart-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 20px 80px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.cart-title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 30px;
    color: #111;
}

/* 비율: 왼쪽 4 : 오른쪽 6 */
.cart-layout {
    display: grid;
    grid-template-columns: 4fr 6fr;
    gap: 20px;
    align-items: start;
}

/* ── 왼쪽 요약 패널 ── */
.summary-panel {
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 24px 22px;
    background: #fff;
    position: sticky;
    top: 20px;
}

.store-badge:hover {
    transform: translateX(4px);
}

.store-badge {
  cursor: pointer;
  transition: transform 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #111;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 4px;
}
.store-icon { font-size: 1.1rem; }

.price-section {
    padding: 14px 0;
    border-bottom: 1px solid #f0f0f0;
}

.section-label {
    font-size: 0.83rem;
    color: #555;
    margin-bottom: 8px;
    font-weight: 500;
}

.price-breakdown {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 8px;
}

.breakdown-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
    color: #999;
}

.breakdown-name {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.breakdown-total {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #333;
    font-weight: 500;
    padding-top: 6px;
    border-top: 1px dashed #eee;
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price-val {
    font-size: 0.85rem;
    color: #888;
}

.total-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 0 20px;
}

.total-label { font-size: 0.95rem; font-weight: 600; color: #111; }
.total-val { font-size: 1.15rem; font-weight: 700; color: #111; }

.order-btn {
    width: 100%;
    padding: 13px;
    background: #4A90E2;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    margin-bottom: 10px;
}
.order-btn:hover { background: #357ABD; }
.order-btn.secondary { margin-bottom: 0; }

.clear-btn {
    width: 100%;
    padding: 10px;
    background: #fff;
    color: #aaa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
}
.clear-btn:hover { background: #fff0f0; color: #ff4d4f; border-color: #ffccc7; }

/* ── 오른쪽 아이템 패널 ── */
.cart-items-panel {
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background: #fff;
    min-height: 480px;
    overflow: hidden;
}

.items-toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 14px 16px;
    border-bottom: 1px solid #f0f0f0;
}

.toolbar-btn {
    padding: 6px 14px;
    border-radius: 6px;
    border: none;
    font-size: 0.82rem;
    cursor: pointer;
    font-weight: 500;
}
.select-all { background: #4A90E2; color: #fff; }
.delete-selected { background: #ff4d4f; color: #fff; }

/* 아이템 카드 */
.item-list { display: flex; flex-direction: column; }

.cart-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 18px;
    border-bottom: 1px solid #f5f5f5;
}
.cart-item:last-child { border-bottom: none; }

.item-check {
    width: 17px;
    height: 17px;
    cursor: pointer;
    flex-shrink: 0;
}

.item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.item-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: #111;
}

.item-price {
    font-size: 0.82rem;
    color: #888;
}

.option-btn {
    width: fit-content;
    padding: 5px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    font-size: 0.78rem;
    color: #555;
    cursor: pointer;
}
.option-btn:hover { background: #f5f5f5; }

.item-img {
    width: 100px;
    height: 100px;
    border-radius: 10px;
    object-fit: cover;
    background: #f0f0f0;
    flex-shrink: 0;
}

/* 수량 조절 */
.quantity-ctrl {
    display: flex;
    align-items: center;
    width: fit-content;
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
}

.quantity-ctrl button {
    width: 30px;
    height: 28px;
    border: none;
    background: #f5f5f5;
    font-size: 1rem;
    cursor: pointer;
    color: #333;
}
.quantity-ctrl button:hover { background: #e8e8e8; }

.quantity-ctrl span {
    width: 34px;
    text-align: center;
    font-size: 0.9rem;
    font-weight: 500;
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
    line-height: 28px;
}

/* 빈 장바구니 */
.empty-cart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 480px;
    gap: 14px;
    background: #fafafa;
}
.empty-icon { font-size: 2.5rem; }
.empty-cart p { font-size: 1rem; color: #999; font-weight: 500; }
</style>
