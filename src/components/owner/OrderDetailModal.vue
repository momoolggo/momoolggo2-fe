<script setup>
import { computed } from 'vue';
import ownerService from '@/services/ownerService';
import { showAlert, showConfirm } from '@/composables/useAlert'

const props = defineProps(['order']);
const emit = defineEmits(['close']);

const currentState = computed(() => Number(props.order?.state ?? 0));

// 상태 변경 (다음 단계로)
const changeState = async (newState) => {
  try {
    await ownerService.updateOrderState(props.order.orderId, newState);

    const stateNames = {
      3: '주문을 수락했습니다.',
      4: '라이더 배차를 진행합니다.',
      5: '배달이 시작되었습니다.',
      6: '배달이 완료되었습니다.',
    };
    await showAlert(stateNames[newState] || '상태가 변경되었습니다.', { title: '상태 변경', type: 'success' });
    emit('close');
  } catch (error) {
    console.error("상태 변경 실패:", error);
    await showAlert('상태 변경에 실패했습니다.', { title: '상태 변경', type: 'error' });
  }
};

// 주문 취소 (DB 삭제)
const cancelOrder = async () => {
  const confirmed = await showConfirm('정말 주문을 취소하시겠습니까?\n취소된 주문은 복구할 수 없습니다.', { title: '주문 취소', type: 'warning' });
  if (!confirmed) return;
  try {
    await ownerService.deleteOrder(props.order.orderId);
    await showAlert('주문이 취소되었습니다.', { title: '주문 취소', type: 'success' });
    emit('close');
  } catch (error) {
    console.error("주문 취소 실패:", error);
    await showAlert('주문 취소에 실패했습니다.', { title: '주문 취소', type: 'error' });
  }
};

// 상태 단계 표시용 (5단계)
const steps = [
  { state: 1, label: '주문 대기' },
  { state: 3, label: '조리 중' },
  { state: 5, label: '배달 중' },
  { state: 6, label: '배달 완료' },
];

// changeState 호출 부분
// 상태 1(대기) → 3(조리중/수락)
// 상태 3 → 4(라이더배차) → 5(배달중) → 6(배달완료)
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>주문상세</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- 상태 진행 바 -->
      <div class="status-stepper">
        <div
          v-for="step in steps"
          :key="step.state"
          class="step"
          :class="{
            active: currentState === step.state,
            done: currentState > step.state
          }"
        >
          <div class="step-circle">
            <span v-if="currentState > step.state">✓</span>
            <span v-else>{{ step.state + 1 }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
        <div class="step-line"></div>
      </div>

      <div class="modal-body">
        <!-- 주문자 정보 -->
        <section class="info-section">
          <h3>주문자 정보</h3>
          <div class="info-grid">
            <p><strong>이름:</strong> {{ order.customerName || '-' }}</p>
            <p><strong>전화:</strong> {{ order.tel || '-' }}</p>
            <p><strong>주소:</strong> {{ order.address || '-' }}</p>
            <p><strong>요청사항:</strong> {{ order.request || '-' }}</p>
          </div>
        </section>

        <!-- 메뉴 정보 -->
        <section class="info-section">
          <h3>메뉴 정보</h3>
          <p class="menu-list-text">{{ order.menuList }}</p>
          <hr />
          <p class="total-price">
            <strong>총 주문 금액:</strong>
            {{ Number(order.totalPrice || 0).toLocaleString() }}원
          </p>
        </section>
      </div>

      <!-- 액션 버튼 (상태에 따라 다르게 표시) -->
      <div class="modal-footer">
        <!-- 배달 완료 전까지만 취소 가능 -->
        <button v-if="currentState < 6" class="btn cancel" @click="cancelOrder">
          주문 취소
        </button>

        <!-- 상태 0: 수락 대기 → 주문 수락 -->
        <button v-if="currentState === 1" class="btn accept" @click="changeState(3)">주문 수락</button>
        <button v-if="currentState === 3" class="btn rider" @click="changeState(4)">라이더 배차</button>
        <button v-if="currentState === 4" class="btn shipping" @click="changeState(5)">배달 시작</button>
        <button v-if="currentState === 5" class="btn complete" @click="changeState(6)">배달 완료</button>
        <span v-if="currentState === 6" class="status-msg complete-msg">배달 완료</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 0;
  border-radius: 16px;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 { margin: 0; font-size: 18px; }

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

/* 상태 진행 바 */
.status-stepper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 20px 16px;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  flex: 1;
}

.step-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e8e8e8;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step.active .step-circle {
  background: #4caf50;
  color: white;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
}

.step.done .step-circle {
  background: #1890ff;
  color: white;
}

.step-label {
  font-size: 11px;
  color: #999;
  text-align: center;
}

.step.active .step-label { color: #4caf50; font-weight: bold; }
.step.done .step-label { color: #1890ff; }

.step-line {
  position: absolute;
  top: 41px;
  left: 10%;
  right: 10%;
  height: 3px;
  background: #e8e8e8;
  z-index: 0;
}

/* 본문 */
.modal-body { padding: 0 24px; }

.info-section {
  margin: 16px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.info-section h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.info-grid p {
  margin: 6px 0;
  font-size: 14px;
  color: #555;
}

.menu-list-text {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.total-price {
  font-size: 16px;
  color: #111;
  text-align: right;
  margin-top: 12px;
}

/* 하단 버튼 */
.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 24px 24px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: white;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.85; }


.cancel   { background: #c42427; }
.accept   { background: #41c045; }
.rider    { background: #ffb700; }
.shipping { background: #5024c6; }
.complete { background: #1890ff; }

.status-msg {
  font-size: 15px;
  font-weight: bold;
  padding: 10px;
}

.complete-msg { color: #1890ff; }
</style>