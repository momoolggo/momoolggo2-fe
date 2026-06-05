<script setup>
import { computed, ref } from 'vue'
import { useDeliveryStore } from '@/stores/deliveryStore'
import deliveryService from '@/services/deliveryService'
import CompleteModal from '@/components/rider/CompleteModal.vue'
import CancelModal from '@/components/rider/CancelModal.vue'
import RiderDeliveryMap from '@/components/rider/RiderDeliveryMap.vue'
import { showAlert } from '@/composables/useAlert'

const deliveryStore = useDeliveryStore()

// 진행 중 배달 1건 (라이더 1명이 동시 1건 — R3-b 정책)
const current = computed(() => deliveryStore.currentDelivery())

// 단계별 다음 액션 매핑.
// 자잘 에러 트랙 #8 (2026-05-23): 라이더 UX 4단계 — 배차 수락(WaitingTab claim) / 가게 도착 / 픽업 완료 / 배달 완료.
// PICKED_UP은 race fallback 매핑 유지 (pickup 후 depart 자동 호출이 실패하면 다시 시도 가능).
// 색: 가게 도착=파랑 / 픽업 완료=주황 / 배달 완료=초록. (배차 수락은 WaitingTab의 빨강 그대로)
const nextAction = computed(() => {
  if (!current.value) return null
  const map = {
    ASSIGNED:        { label: '가게 도착',  fn: 'accept',   promptText: '가게에 도착하셨습니까?',     colorClass: 'btn_arrive' },
    AWAITING_PICKUP: { label: '픽업 완료',  fn: 'pickup',   promptText: '음식을 픽업 완료하셨습니까?', colorClass: 'btn_pickup' },
    PICKED_UP:       { label: '배달 시작',  fn: 'depart',   promptText: '배달지로 출발하시겠습니까?', colorClass: 'btn_pickup' },
    DELIVERING:      { label: '배달 완료',  fn: 'complete', promptText: null,                          colorClass: 'btn_complete' },
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
    if (fn === 'accept') await deliveryService.accept(current.value.deliveryNo)
    else if (fn === 'pickup') {
      // 자잘 에러 트랙 #8 — 4단계 UX: pickup 직후 depart 자동 호출하여 PICKED_UP 화면을 건너뛰고
      // DELIVERING 상태에서 "배달 완료" 버튼을 노출. depart 실패 시 PICKED_UP fallback 매핑이 다음 화면을 책임짐.
      await deliveryService.pickup(current.value.deliveryNo)
      try {
        await deliveryService.depart(current.value.deliveryNo)
      } catch (e) {
        // depart만 실패한 경우 — 화면 reload 후 PICKED_UP 상태에서 "배달 시작" 버튼 fallback
      }
    }
    else if (fn === 'depart') await deliveryService.depart(current.value.deliveryNo)
    promptOpen.value = false
    await deliveryStore.loadInProgress()
  } catch (err) {
    await showAlert(err.response?.data?.resultMessage ?? '처리에 실패했습니다.', { title: '처리 실패', type: 'error' })
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

// 2026-05-25 9건 트랙 #9 — 라이더 네비게이션 (네이버 지도 길찾기).
// 단계별 목적지 분기: ASSIGNED/ARRIVED/AWAITING = 가게(픽업), PICKED_UP/DELIVERING = 배달지.
// 모바일: nmap:// URI (네이버 지도 앱 자동 실행). 데스크탑: 네이버 신지도 웹.
const navigateToTarget = async () => {
  if (!current.value) return
  const status = current.value.status
  const goingToStore = ['ASSIGNED', 'ARRIVED_AT_STORE', 'AWAITING_PICKUP'].includes(status)
  const lat = goingToStore ? current.value.pickupLat : current.value.deliveryLat
  const lng = goingToStore ? current.value.pickupLng : current.value.deliveryLng
  const addr = goingToStore ? current.value.pickupAddress : current.value.deliveryAddress
  const name = goingToStore ? '가게(픽업지)' : '배달지'
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // 2026-05-25 정정 — 네이버 지도 앱 "네비게이션 즉시 시작" URI (nmap://navigation).
  // 모바일: 앱이 네비 모드로 진입. PC fallback: 네이버 모바일 지도 길찾기 (PC는 네비 앱 없음).
  if (lat && lng) {
    if (isMobile) {
      window.location.href = `nmap://navigation?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(name)}&appname=com.momoolggo.rider`
    } else {
      const url = `https://m.map.naver.com/route.naver?menu=route&pathType=1&fromName=현재위치&toName=${encodeURIComponent(name)}&toX=${lng}&toY=${lat}`
      window.open(url, '_blank', 'noopener')
    }
    return
  }

  // 좌표 NULL fallback — 주소 텍스트로 네이버 길찾기 검색 (delivery 테이블 좌표 NULL 케이스).
  if (addr) {
    const query = encodeURIComponent(addr)
    if (isMobile) {
      window.location.href = `nmap://search?query=${query}&appname=com.momoolggo.rider`
    } else {
      window.open(`https://map.naver.com/p/search/${query}`, '_blank', 'noopener')
    }
    return
  }

  await showAlert('목적지 좌표와 주소가 모두 없습니다.', { title: '목적지 없음', type: 'warning' })
}
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
        v-if="(current.pickupLat && current.pickupLng) || (current.deliveryLat && current.deliveryLng)"
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

      <!-- 2026-05-25 9건 트랙 #3 — 가게/배달 요청사항 표시 -->
      <div v-if="current.orderRequest" class="request_block">
        <p class="request_label">📝 가게 요청사항</p>
        <p class="request_text">{{ current.orderRequest }}</p>
      </div>
      <div v-if="current.riderRequest" class="request_block">
        <p class="request_label">🛵 배달 요청사항</p>
        <p class="request_text">{{ current.riderRequest }}</p>
      </div>

      <p class="order_no">주문번호 {{ current.orderId }}</p>

      <!-- 2026-05-25 9건 트랙 #9 — 라이더 네이버 지도 길찾기 -->
      <button class="nav_btn" @click="navigateToTarget">
        🗺️
        네이버 지도로
        {{ ['ASSIGNED', 'ARRIVED_AT_STORE', 'AWAITING_PICKUP'].includes(current.status)
           ? '가게 길찾기' : '배달지 길찾기' }}
      </button>

      <div class="action_btns">
        <button v-if="nextAction" class="action_btn" :class="nextAction.colorClass" @click="onActionClick">
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
.request_block {
  background: #fff8e6;
  border: 1px solid #ffe6b3;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.request_label { font-size: 12px; color: #b45309; font-weight: 700; }
.request_text { font-size: 14px; color: #333; line-height: 1.4; }
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

/* 2026-05-25 9건 트랙 #9 — 네비게이션 버튼 */
.nav_btn {
  width: 100%;
  padding: 11px 0;
  background: #00C73C;
  color: #fff;
  border: 0;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 4px;
}
.nav_btn:hover { filter: brightness(0.92); }
.action_btns { display: flex; gap: 8px; margin-top: 4px; }
.action_btn {
  flex: 2;
  padding: 12px 0;
  color: #fff;
  border: 0;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
}
.action_btn:hover { filter: brightness(0.92); }
/* 자잘 에러 트랙 #8 — 단계별 색 분리 UX */
.btn_arrive   { background: #1976d2; }  /* 가게 도착 = 파랑 */
.btn_pickup   { background: #f57c00; }  /* 픽업 완료 / 배달 시작 = 주황 */
.btn_complete { background: #2e7d32; }  /* 배달 완료 = 초록 */
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
  position: absolute; inset: 0;
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
