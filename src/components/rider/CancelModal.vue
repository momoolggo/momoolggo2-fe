<script setup>
import { ref } from 'vue'
import deliveryService from '@/services/deliveryService'

const props = defineProps({
  deliveryNo: { type: String, required: true },
})
const emit = defineEmits(['close', 'cancelled'])

// R6-cancel reason 3종 (decision-#34 (가) enum 단독, decision-#39 (가) Image 170148 모달 패턴 일관)
const reason = ref(null)
const submitting = ref(false)

const reasonOptions = [
  { key: 'ACCIDENT', label: '사고 발생' },
  { key: 'PERSONAL', label: '개인적인 사유' },
  { key: 'OTHER',    label: '기타' },
]

const submit = async () => {
  if (!reason.value) return
  submitting.value = true
  try {
    await deliveryService.cancel(props.deliveryNo, { reason: reason.value })
    emit('cancelled')
  } catch (err) {
    alert(err.response?.data?.resultMessage ?? '반려 처리에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="modal_backdrop" @click.self="emit('close')">
    <div class="modal">
      <div class="modal_header">
        <h3>배달 반려</h3>
        <button class="x_btn" @click="emit('close')">×</button>
      </div>

      <p class="hint">반려 사유를 선택해주세요.</p>

      <ul class="radio_list">
        <li
          v-for="opt in reasonOptions"
          :key="opt.key"
          class="radio_item"
          :class="{ selected: reason === opt.key }"
          @click="reason = opt.key"
        >
          <span class="dot" :class="{ on: reason === opt.key }"></span>
          {{ opt.label }}
        </li>
      </ul>

      <p class="caption">※ 반려 시 다른 라이더에게 재배차됩니다.</p>

      <div class="modal_btns">
        <button class="btn_outline" @click="emit('close')" :disabled="submitting">취소</button>
        <button class="btn_primary" @click="submit" :disabled="!reason || submitting">반려 처리</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal_backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  padding: 16px; z-index: 100;
}
.modal {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 20px;
  width: 100%;
  max-width: 360px;
  display: flex; flex-direction: column; gap: 14px;
}
.modal_header { display: flex; justify-content: space-between; align-items: center; }
.modal_header h3 { font-size: 16px; font-weight: 700; color: var(--primary); }
.x_btn { background: none; border: none; font-size: 22px; color: var(--gray); cursor: pointer; }

.hint { font-size: 14px; color: var(--gray-dark); text-align: center; }

.radio_list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.radio_item {
  display: flex; align-items: center; gap: 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.radio_item.selected { border-color: var(--primary); background: var(--primary-light); }
.dot {
  width: 16px; height: 16px;
  border: 2px solid var(--gray-light);
  border-radius: 50%;
  flex-shrink: 0;
}
.dot.on { border-color: var(--primary); background: var(--primary); box-shadow: inset 0 0 0 3px var(--white); }

.caption { font-size: 11px; color: var(--gray-light); text-align: center; }

.modal_btns { display: flex; gap: 8px; }
.modal_btns > button { flex: 1; padding: 11px 0; font-size: 14px; border-radius: var(--radius-md); cursor: pointer; font-weight: 600; }
.btn_outline {
  background: var(--white);
  color: var(--gray-dark);
  border: 1.5px solid var(--border);
}
.btn_outline:hover:not(:disabled) { background: var(--bg); }
</style>
