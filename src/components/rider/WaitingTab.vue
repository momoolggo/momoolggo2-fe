<script setup>
import { useDeliveryStore } from '@/stores/deliveryStore'
import deliveryService from '@/services/deliveryService'
import { ref } from 'vue'

const deliveryStore = useDeliveryStore()
const selected = ref(null) // 선택된 배달 (상세 모달)

const accept = async (deliveryNo) => {
  try {
    await deliveryService.accept(deliveryNo)
    selected.value = null
    await deliveryStore.loadWaiting()
    await deliveryStore.loadInProgress()
    deliveryStore.setTab('inprogress')
  } catch (err) {
    alert(err.response?.data?.resultMessage ?? '배차 수락에 실패했습니다.')
  }
}

const formatFee = (fee) => `${(fee ?? 0).toLocaleString()}원`
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
        <dl class="detail">
          <div><dt>배달번호</dt><dd>{{ selected.deliveryNo }}</dd></div>
          <div><dt>주문번호</dt><dd>{{ selected.orderId }}</dd></div>
          <div><dt>가게 주소</dt><dd>{{ selected.pickupAddress }}</dd></div>
          <div><dt>가게 전화</dt><dd>{{ selected.pickupPhone }}</dd></div>
          <div><dt>배달 주소</dt><dd>{{ selected.deliveryAddress }}</dd></div>
          <div><dt>손님 전화</dt><dd>{{ selected.customerPhone }}</dd></div>
          <div><dt>배달료</dt><dd>{{ formatFee((selected.baseFee ?? 0) + (selected.extraFee ?? 0)) }}</dd></div>
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
  z-index: 100;
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
