<script setup>
import { reactive, onMounted, onUnmounted, ref } from 'vue';
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
    request: '',
    riderRequest: '',
});

// 토스페이먼츠 위젯 인스턴스
let widgets = null;
const isWidgetReady = ref(false);

// ✅ 토스페이먼츠 SDK 동적 로드
const loadTossScript = () => {
    return new Promise((resolve, reject) => {
        if (window.TossPayments) return resolve();
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v2/standard';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// ✅ 토스 위젯 초기화 & 렌더링
const initTossWidget = async (amount) => {
    const CLIENT_KEY = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'; // 🔑 본인 클라이언트 키로 교체
    const CUSTOMER_KEY = 'eK4YFpGSvYQvtfwVK6L3a';                 // 🔑 실제 회원 고유키로 교체

    const tossPayments = window.TossPayments(CLIENT_KEY);
    widgets = tossPayments.widgets({ customerKey: CUSTOMER_KEY });

    await widgets.setAmount({ currency: 'KRW', value: amount });

    await Promise.all([
        widgets.renderPaymentMethods({
            selector: '#payment-method',
            variantKey: 'DEFAULT',
        }),
        widgets.renderAgreement({
            selector: '#agreement',
            variantKey: 'AGREEMENT',
        }),
    ]);

    isWidgetReady.value = true;
};

const loadOrderInfo = async () => {
    try {
        const res = await orderService.getOrderInfo();
        const data = res.resultData;
        state.storeName     = data.storeName;
        state.tel           = data.tel;
        state.address       = data.address;
        state.addressDetail = data.addressDetail;
        state.items         = data.items;
        state.menuTotal     = data.menuTotal;
        state.deliveryFee   = data.deliveryFee;
        state.totalAmount   = data.totalAmount;
    } catch (e) {
        console.error('주문 정보 로드 실패:', e);

        // ✅ 백엔드 완성 전 임시 더미 데이터
        state.storeName   = '테스트 가게';
        state.tel         = '01012341234';
        state.address     = '서울시 강남구';
        state.addressDetail = '101호';
        state.items       = [{ name: '테스트 메뉴' }];
        state.menuTotal   = 45000;
        state.deliveryFee = 3000;
        state.totalAmount = 48000;
    }

    // ✅ 성공/실패 상관없이 항상 위젯 초기화
    try {
        await loadTossScript();
        await initTossWidget(state.totalAmount);
    } catch (e) {
        console.error('토스 위젯 초기화 실패:', e);
    }
};

onMounted(loadOrderInfo);

// ✅ 결제하기 버튼
const handleOrder = async () => {
    if (!state.address) {
        alert('배송지를 설정해주세요.');
        return;
    }
    if (!isWidgetReady.value) {
        alert('결제 위젯이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    try {
        // ✅ 서버에 주문 사전 등록 후 orderId 받아오기 (없으면 임시 생성)
        const orderId = `ORDER-${Date.now()}`;
        const orderName = state.items.length > 1
            ? `${state.items[0].name} 외 ${state.items.length - 1}건`
            : state.items[0]?.name ?? '주문';

        await widgets.requestPayment({
            orderId,
            orderName,
            successUrl: `${window.location.origin}/payment/success`,
            failUrl:    `${window.location.origin}/payment/fail`,
            customerEmail:       '',          // 필요시 state에서 가져오기
            customerName:        '',          // 필요시 state에서 가져오기
            customerMobilePhone: state.tel,
        });
    } catch (e) {
        console.error('결제 요청 실패:', e);
        alert('결제 요청에 실패했습니다. 다시 시도해주세요.');
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

            <!-- ✅ 토스페이먼츠 결제 위젯 -->
            <div class="section">
                <div class="section-label">결제 수단</div>
                <div id="payment-method"></div>
                <div id="agreement"></div>
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
            <button class="order-btn" @click="handleOrder" :disabled="!isWidgetReady">
                {{ isWidgetReady ? '결제하기' : '위젯 로딩 중...' }}
            </button>

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
.badge { background: #ff4d4f; color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 6px; }
.price-box { border: 1px solid #eee; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
.price-row { display: flex; justify-content: space-between; font-size: 0.9rem; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
.price-row:last-child { border-bottom: none; }
.price-row.total { font-weight: 700; font-size: 1rem; }
.order-btn { width: 100%; padding: 15px; background: #4A90E2; color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
.order-btn:hover:not(:disabled) { background: #357ABD; }
.order-btn:disabled { background: #aaa; cursor: not-allowed; }
</style>
