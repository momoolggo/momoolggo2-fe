<script setup>
import { useDeliveryStore } from '@/stores/deliveryStore'
import deliveryService from '@/services/deliveryService'
import RiderDeliveryMap from '@/components/rider/RiderDeliveryMap.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { showAlert } from '@/composables/useAlert'
import { useNotificationSound } from '@/composables/useNotificationSound'

const deliveryStore = useDeliveryStore()
const selected = ref(null) // 선택된 배달 (상세 모달)
const eventSource = ref(null)
// 2026-06-06 — 새 배차 도착 시 알림음 (페이지 진입 시 무음 priming → 이후 order-assigned 즉시 재생)
const { play: playNotificationSound } = useNotificationSound()

// 라이더 풀에서 본인 잡기 — WAITING_ASSIGN → ASSIGNED. code-reviewer 결함 1번 정정 (2026-05-19).
// accept는 ASSIGNED → ARRIVED_AT_STORE (가게 도착)이라 풀 잡기에 부적합.
const accept = async (deliveryNo) => {
  try {
    await deliveryService.claim(deliveryNo)
    selected.value = null
    await deliveryStore.loadWaiting()
    await deliveryStore.loadInProgress()
    deliveryStore.setTab('inprogress')
  } catch (err) {
    await showAlert(err.response?.data?.resultMessage ?? '배차 수락에 실패했습니다.', { title: '배차 실패', type: 'error' })
  }
}

const formatFee = (fee) => `${(fee ?? 0).toLocaleString()}원`

// 자잘 에러 트랙(2026-05-23) — SSE 배차 알림 구독.
// order-assigned: 새 배차 도착 → state.waiting 갱신 + 자동 모달 popup
// order-claimed:  다른 라이더가 잡음 → 같은 deliveryNo면 모달 자동 close + 목록에서 제거
onMounted(() => {
  eventSource.value = deliveryService.subscribeStream(
    (row) => {
      const exists = deliveryStore.state.waiting.some((d) => d.deliveryNo === row.deliveryNo)
      if (!exists) {
        deliveryStore.state.waiting.unshift(row)
      }
      selected.value = row
      playNotificationSound()
    },
    (deliveryNo) => {
      deliveryStore.state.waiting = deliveryStore.state.waiting.filter(
        (d) => d.deliveryNo !== deliveryNo
      )
      if (selected.value && selected.value.deliveryNo === deliveryNo) {
        selected.value = null
      }
    }
  )
})

onBeforeUnmount(() => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
})
</script>

<template>
  <div class="waiting_tab">
    <p v-if="deliveryStore.state.loadingWaiting" class="hint">불러오는 중...</p>
    <p v-else-if="deliveryStore.state.waiting.length === 0" class="empty">
      현재 배차 대기 중인 배달이 없습니다.
    </p>

    <ul v-else class="card_list">
      <li
        v-for="d in deliveryStore.state.waiting"
        :key="d.deliveryNo"
        class="card"
        @click="selected = d"
      >
        <div class="row1">
          <span class="badge_status">배차 대기</span>
          <span class="fee">{{ formatFee((d.baseFee ?? 0) + (d.extraFee ?? 0)) }}</span>
        </div>
        <p class="addr">📍 {{ d.pickupAddress ?? '가게 주소 없음' }}</p>
        <p class="addr_to">→ {{ d.deliveryAddress ?? '배달지 주소 없음' }}</p>
      </li>
    </ul>

    <!-- ── 상세 모달 ── -->
    <div v-if="selected" class="modal_backdrop" @click.self="selected = null">
      <div class="modal">
        <div class="modal_header">
          <h3>배달 상세</h3>
          <button class="x_btn" @click="selected = null">×</button>
        </div>
        <RiderDeliveryMap
          v-if="selected.pickupLat && selected.pickupLng && selected.deliveryLat && selected.deliveryLng"
          :pickup-lat="selected.pickupLat"
          :pickup-lng="selected.pickupLng"
          :delivery-lat="selected.deliveryLat"
          :delivery-lng="selected.deliveryLng"
          height="200px"
        />
        <dl class="detail">
          <div><dt>배달번호</dt><dd>{{ selected.deliveryNo }}</dd></div>
          <div><dt>주문번호</dt><dd>{{ selected.orderId }}</dd></div>
          <div><dt>가게 주소</dt><dd>{{ selected.pickupAddress }}</dd></div>
          <div><dt>가게 전화</dt><dd>{{ selected.pickupPhone }}</dd></div>
          <div><dt>배달 주소</dt><dd>{{ selected.deliveryAddress }}</dd></div>
          <div><dt>손님 전화</dt><dd>{{ selected.customerPhone }}</dd></div>
          <div><dt>배달료</dt><dd>{{ formatFee((selected.baseFee ?? 0) + (selected.extraFee ?? 0)) }}</dd></div>
          <!-- 2026-05-25 9건 트랙 #3 — 요청사항 표시 (있을 때만) -->
          <div v-if="selected.orderRequest"><dt>가게 요청</dt><dd>{{ selected.orderRequest }}</dd></div>
          <div v-if="selected.riderRequest"><dt>배달 요청</dt><dd>{{ selected.riderRequest }}</dd></div>
        </dl>
        <button class="btn_primary accept_btn" @click="accept(selected.deliveryNo)">
          배차 수락
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.waiting_tab { padding: 0 16px; }
.hint, .empty { text-align: center; color: var(--gray); padding: 60px 0; font-size: 14px; }

.card_list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.card:hover { border-color: var(--primary); }

.row1 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.badge_status {
  background: var(--primary-light);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 10px;
}
.fee { font-size: 16px; font-weight: 700; color: var(--black); }
.addr { font-size: 13px; color: var(--gray-dark); margin: 2px 0; }
.addr_to { font-size: 13px; color: var(--gray); margin: 2px 0 0 12px; }

.modal_backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  z-index: 1000;
}
.modal {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 20px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal_header { display: flex; justify-content: space-between; align-items: center; }
.modal_header h3 { font-size: 16px; font-weight: 700; }
.x_btn { background: none; border: none; font-size: 22px; color: var(--gray); cursor: pointer; }

.detail { display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
.detail > div { display: flex; justify-content: space-between; gap: 12px; }
.detail dt { color: var(--gray); min-width: 70px; }
.detail dd { color: var(--black); text-align: right; flex: 1; }

.accept_btn { margin-top: 8px; width: 100%; padding: 12px 0; }
</style>
