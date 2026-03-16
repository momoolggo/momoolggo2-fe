<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import orderService from '@/services/orderService';

const router = useRouter();

const state = reactive({
    storeName: '',
    tel: '',
    address: '',
    addressDetail: '',
    items: [],
    menuTotal: 0,
    deliveryFee: 0,
    totalAmount: 0,
    payState: 1,        // 기본값: 신용/체크카드
    request: '',        // 가게 요청사항
    riderRequest: '',   // 라이더 요청사항
});

const loadOrderInfo = async () => {
    try {
        const res = await orderService.getOrderInfo();
        const data = res.resultData;
        state.storeName    = data.storeName;
        state.tel          = data.tel;
        state.address      = data.address;
        state.addressDetail = data.addressDetail;
        state.items        = data.items;
        state.menuTotal    = data.menuTotal;
        state.deliveryFee  = data.deliveryFee;
        state.totalAmount  = data.totalAmount;
    } catch (e) {
        console.error('주문 정보 로드 실패:', e);
        alert('주문 정보를 불러오지 못했습니다.');
        
    }
};

onMounted(loadOrderInfo);

const handleOrder = async () => {
    if (!state.address) {
        alert('배송지를 설정해주세요.');
        return;
    }

    try {
        await orderService.placeOrder({
            request:      state.request,
            riderRequest: state.riderRequest,
            payState:     state.payState,
        });
        alert('주문이 완료되었습니다! 🎉');
        router.push('/');
    } catch (e) {
        console.error('주문 실패:', e);
        alert('주문에 실패했습니다. 다시 시도해주세요.');
    }
};
</script>

<template>
<div class="order-page">
    <h2 class="order-title">결제하기</h2>

    <div class="order-layout">
        <section class="order-left">

            <!-- 가게명 -->
            <div class="store-name-row">
                <img src="/favicon.png" class="store-icon" />
                <span class="store-name">{{ state.storeName }}</span>
            </div>

            <!-- 배달 정보 -->
            <div class="section">
                <div class="section-label">배달 정보</div>
                <div class="input-row">
                    <input :value="state.address + ' ' + state.addressDetail"
                           readonly class="input-field" />
                    <button class="change-btn">변경하기</button>
                </div>
            </div>

            <!-- 휴대폰 번호 -->
            <div class="section">
                <div class="section-label">휴대폰 번호</div>
                <div class="input-row">
                    <input :value="state.tel" readonly class="input-field" />
                    <button class="change-btn">변경하기</button>
                </div>
            </div>

            <!-- 주문 요청사항 (가게) -->
            <div class="section">
                <div class="section-label">주문 요청사항 (가게)</div>
                <input v-model="state.request"
                       placeholder="요청사항을 입력하세요"
                       class="input-field full" />
            </div>

            <!-- 주문 요청사항 (라이더) -->
            <div class="section">
                <div class="section-label">주문 요청사항 (라이더)</div>
                <input v-model="state.riderRequest"
                       placeholder="요청사항을 입력하세요"
                       class="input-field full" />
            </div>

        </section>

        <section class="order-right">

            <!-- 결제 수단 -->
            <div class="section">
                <div class="section-label">결제 수단</div>
                <div class="pay-options">
                    <label><input type="radio" v-model="state.payState" :value="1" /> 신용 / 체크카드</label>
                    <label><input type="radio" v-model="state.payState" :value="2" /> 카카오 페이</label>
                    <label><input type="radio" v-model="state.payState" :value="3" /> 네이버 페이</label>
                    <label><input type="radio" v-model="state.payState" :value="4" /> 만나서 결제</label>
                </div>
            </div>

            <!-- 쿠폰 (2차) -->
            <div class="section">
                <div class="section-label">쿠폰 선택 <span class="badge">쿠폰은 2차</span></div>
                <select class="input-field full" disabled>
                    <option>사용 가능한 쿠폰</option>
                </select>
            </div>

            <!-- 금액 정리 -->
            <div class="price-box">
                <div class="price-row">
                    <span>메뉴 금액</span>
                    <span>{{ state.menuTotal.toLocaleString() }}원</span>
                </div>
                <div class="price-row">
                    <span>배달팁</span>
                    <span>{{ state.deliveryFee.toLocaleString() }}원</span>
                </div>
                <div class="price-row total">
                    <span>총 결제 금액</span>
                    <span>{{ state.totalAmount.toLocaleString() }}원</span>
                </div>
            </div>

            <!-- 결제하기 버튼 -->
            <button class="order-btn" @click="handleOrder">결제하기</button>

        </section>
    </div>
</div>
</template>

<style scoped>
.order-page { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
.order-title { text-align: center; font-size: 1.5rem; font-weight: 600; margin-bottom: 30px; }
.order-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.store-name-row { display: flex; align-items: center; gap: 10px; font-size: 1.1rem; font-weight: 700; margin-bottom: 24px; }
.store-icon { width: 32px; height: 32px; border-radius: 6px; }
.section { margin-bottom: 24px; }
.section-label { font-size: 0.85rem; color: #555; font-weight: 500; margin-bottom: 8px; }
.input-row { display: flex; gap: 8px; }
.input-field { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem; background: #fafafa; }
.input-field.full { width: 100%; box-sizing: border-box; }
.change-btn { padding: 10px 16px; border: 1px solid #ddd; border-radius: 8px; background: #fff; font-size: 0.85rem; cursor: pointer; white-space: nowrap; }
.change-btn:hover { background: #f5f5f5; }
.pay-options { display: flex; flex-direction: column; gap: 12px; }
.pay-options label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; }
.badge { background: #ff4d4f; color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 6px; }
.price-box { border: 1px solid #eee; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
.price-row { display: flex; justify-content: space-between; font-size: 0.9rem; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
.price-row:last-child { border-bottom: none; }
.price-row.total { font-weight: 700; font-size: 1rem; }
.order-btn { width: 100%; padding: 15px; background: #4A90E2; color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
.order-btn:hover { background: #357ABD; }
</style>
