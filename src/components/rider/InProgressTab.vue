<script setup>
import { computed, ref } from 'vue'
import { useDeliveryStore } from '@/stores/deliveryStore'
import deliveryService from '@/services/deliveryService'
import CompleteModal from '@/components/rider/CompleteModal.vue'
import CancelModal from '@/components/rider/CancelModal.vue'
import RiderDeliveryMap from '@/components/rider/RiderDeliveryMap.vue'

const deliveryStore = useDeliveryStore()

// 진행 중 배달 1건 (라이더 1명이 동시 1건 — R3-b 정책)
const current = computed(() => deliveryStore.currentDelivery())

// 단계별 다음 액션 매핑 — ASSIGNED는 accept(R6-FE-3)가 처리하므로 InProgressTab 진입 시점은 ARRIVED부터.
// reviewer C-1 정정: ASSIGNED 항목 제거 (이전엔 fn:'arrive'로 잘못 매핑되어 BE 400 발생 위험).
// ARRIVED_AT_STORE label '가게 도착 확인'으로 정정 (이전 '픽업 대기'는 라이더 관점 어색).
const nextAction = computed(() => {
  if (!current.value) return null
  const map = {
    ARRIVED_AT_STORE: { label: '가게 도착 확인', fn: 'arrive',  promptText: '가게에 도착하셨습니까?'     },
    AWAITING_PICKUP:  { label: '픽업 완료',     fn: 'pickup',  promptText: '음식을 픽업 완료하셨습니까?' },
    PICKED_UP:        { label: '배달 시작',     fn: 'depart',  promptText: '배달지로 출발하시겠습니까?' },
    DELIVERING:       { label: '전달 완료',     fn: 'complete', promptText: null },
  }
  return map[current.value.status] ?? null
})

const promptOpen = ref(false)
const completeOpen = ref(false)
const cancelOpen = ref(false)
const submitting = ref(false)

const onActionClick = () => {
  if (!nextAction.value) return
  if (nextAction.value.fn === 'complete') {
    completeOpen.value = true
  } else {
    promptOpen.value = true
  }
}

const confirmAction = async () => {
  if (!current.value || !nextAction.value) return
  submitting.value = true
  try {
    const fn = nextAction.value.fn
    if (fn === 'arrive') await deliveryService.arrive(current.value.deliveryNo)
    else if (fn === 'pickup') await deliveryService.pickup(current.value.deliveryNo)
    else if (fn === 'depart') await deliveryService.depart(current.value.deliveryNo)
    promptOpen.value = false
    await deliveryStore.loadInProgress()
  } catch (err) {
    alert(err.response?.data?.resultMessage ?? '처리에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

const onCompleted = async () => {
  completeOpen.value = false
  await deliveryStore.loadInProgress()
  deliveryStore.setTab('completed')
}

const onCancelled = async () => {
  cancelOpen.value = false
  await deliveryStore.loadInProgress()
  await deliveryStore.loadWaiting()
  deliveryStore.setTab('waiting')
}

const formatFee = (d) => `${((d.baseFee ?? 0) + (d.extraFee ?? 0)).toLocaleString()}원`

const statusLabel = (s) => ({
  ASSIGNED: '배차 완료',
  ARRIVED_AT_STORE: '가게 도착',
  AWAITING_PICKUP: '픽업 대기',
  PICKED_UP: '픽업 완료',
  DELIVERING: '배달 중',
}[s] ?? s)
</script>

<template>
  <div class="inprogress_tab">
    <p v-if="deliveryStore.state.loadingInProgress" class="hint">불러오는 중...</p>
    <p v-else-if="!current" class="empty">진행 중인 배달이 없습니다.</p>

    <div v-else class="card">
      <div class="row1">
        <span class="badge_status">{{ statusLabel(current.status) }}</span>
        <span class="fee">{{ formatFee(current) }}</span>
      </div>

      <RiderDeliveryMap
        v-if="current.pickupLat && current.deliveryLat"
        :pickup-lat="current.pickupLat"
        :pickup-lng="current.pickupLng"
        :delivery-lat="current.deliveryLat"
        :delivery-lng="current.deliveryLng"
        height="220px"
      />

      <div class="addr_block">
        <p class="addr_label">📍 픽업</p>
        <p class="addr">{{ current.pickupAddress ?? '주소 없음' }}</p>
        <a v-if="current.pickupPhone" :href="`tel:${current.pickupPhone}`" class="phone_btn">
          📞 {{ current.pickupPhone }}
        </a>
      </div>

      <div class="addr_block">
        <p class="addr_label">🏠 배달</p>
        <p class="addr">{{ current.deliveryAddress ?? '주소 없음' }}</p>
        <a v-if="current.customerPhone" :href="`tel:${current.customerPhone}`" class="phone_btn">
          📞 {{ current.customerPhone }}
        </a>
      </div>

      <p class="order_no">주문번호 {{ current.orderId }}</p>

      <div class="action_btns">
        <button v-if="nextAction" class="btn_primary action_btn" @click="onActionClick">
          {{ nextAction.label }}
        </button>
        <button class="btn_cancel" @click="cancelOpen = true">반려</button>
      </div>
    </div>

    <!-- 단순 확인 모달 (arrive/pickup/depart) -->
    <div v-if="promptOpen" class="modal_backdrop" @click.self="promptOpen = false">
      <div class="modal_small">
        <p class="prompt">{{ nextAction?.promptText }}</p>
        <div class="modal_btns">
          <button class="btn_outline" @click="promptOpen = false" :disabled="submitting">취소</button>
          <button class="btn_primary" @click="confirmAction" :disabled="submitting">확인</button>
        </div>
      </div>
    </div>

    <CompleteModal
      v-if="completeOpen && current"
      :delivery-no="current.deliveryNo"
      :delivery-lat="current.deliveryLat"
      :delivery-lng="current.deliveryLng"
      @close="completeOpen = false"
      @completed="onCompleted"
    />

    <CancelModal
      v-if="cancelOpen && current"
      :delivery-no="current.deliveryNo"
      @close="cancelOpen = false"
      @cancelled="onCancelled"
    />
  </div>
</template>

<style scoped>
.inprogress_tab { padding: 0 16px; }
.hint, .empty { text-align: center; color: var(--gray); padding: 60px 0; font-size: 14px; }

.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row1 { display: flex; justify-content: space-between; align-items: center; }
.badge_status {
  background: var(--primary);
  color: var(--white);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 10px;
}
.fee { font-size: 18px; font-weight: 800; color: var(--black); }

.addr_block {
  background: var(--bg);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.addr_label { font-size: 12px; color: var(--gray); font-weight: 600; }
.addr { font-size: 14px; color: var(--black); }
.phone_btn {
  display: inline-block;
  margin-top: 4px;
  font-size: 13px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.order_no { font-size: 12px; color: var(--gray); text-align: right; }

.action_btns { display: flex; gap: 8px; margin-top: 4px; }
.action_btn { flex: 2; padding: 12px 0; }
.btn_cancel {
  flex: 1;
  background: var(--white);
  color: var(--primary);
  border: 1.5px solid var(--primary);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  padding: 12px 0;
  cursor: pointer;
}
.btn_cancel:hover { background: var(--primary-light); }

.modal_backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  padding: 16px; z-index: 100;
}
.modal_small {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  width: 100%;
  max-width: 320px;
  text-align: center;
  display: flex; flex-direction: column; gap: 16px;
}
.prompt { font-size: 15px; color: var(--black); }
.modal_btns { display: flex; gap: 8px; }
.modal_btns > button { flex: 1; padding: 11px 0; font-size: 14px; border-radius: var(--radius-md); cursor: pointer; }
.btn_outline {
  background: var(--white);
  color: var(--gray-dark);
  border: 1.5px solid var(--border);
  font-weight: 600;
}
.btn_outline:hover:not(:disabled) { background: var(--bg); }
</style>
