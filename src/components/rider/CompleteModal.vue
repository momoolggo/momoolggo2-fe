<script setup>
import { ref } from 'vue'
import deliveryService from '@/services/deliveryService'

const props = defineProps({
  deliveryNo: { type: String, required: true },
})
const emit = defineEmits(['close', 'completed'])

// 1단계: 전달 방식 선택. 2단계: DIRECT는 사진(선택), 그 외는 사유 라디오 + 사진(선택).
const step = ref(1)
const method = ref(null)         // 'DIRECT' | 'CUSTOMER_REQUEST' | 'CUSTOMER_ABSENT'
const photoUrl = ref(null)       // 임시: text input (R6-FE-7 또는 별건에서 file upload 통합)
const submitting = ref(false)

const methodOptions = [
  { key: 'DIRECT',           label: '고객에게 직접 전달했습니다' },
  { key: 'CUSTOMER_REQUEST', label: '고객 요청 위치에 두었습니다' },
  { key: 'CUSTOMER_ABSENT',  label: '고객 부재 — 안전한 곳에 두었습니다' },
]

const goNext = () => {
  if (!method.value) return
  step.value = 2
}

const submit = async () => {
  if (!method.value) return
  submitting.value = true
  try {
    await deliveryService.complete(props.deliveryNo, {
      deliveredMethod: method.value,
      deliveredPhotoUrl: photoUrl.value || null,
    })
    emit('completed')
  } catch (err) {
    alert(err.response?.data?.resultMessage ?? '완료 처리에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="modal_backdrop" @click.self="emit('close')">
    <div class="modal">
      <div class="modal_header">
        <h3>{{ step === 1 ? '전달 방식 선택' : '완료 처리' }}</h3>
        <button class="x_btn" @click="emit('close')">×</button>
      </div>

      <!-- Step 1: 전달 방식 선택 (Image 170143/170148 모달 패턴) -->
      <div v-if="step === 1" class="step">
        <p class="hint">고객에게 어떻게 전달하셨나요?</p>
        <ul class="radio_list">
          <li
            v-for="opt in methodOptions"
            :key="opt.key"
            class="radio_item"
            :class="{ selected: method === opt.key }"
            @click="method = opt.key"
          >
            <span class="dot" :class="{ on: method === opt.key }"></span>
            {{ opt.label }}
          </li>
        </ul>
        <button class="btn_primary next_btn" :disabled="!method" @click="goNext">다음</button>
      </div>

      <!-- Step 2: 사진 (선택) + 완료 -->
      <div v-else class="step">
        <p class="hint">
          <span v-if="method === 'DIRECT'">직접 전달 인증 사진 (선택)</span>
          <span v-else>전달 위치 사진을 첨부해주세요</span>
        </p>
        <input
          v-model="photoUrl"
          type="text"
          placeholder="사진 URL (예: /uploads/delivery/x.jpg) — 업로드 통합은 별건"
          class="inp"
        />
        <p class="caption">※ 사진 업로드 UI는 main-service /internal/files/upload 통합 시 본격.</p>
        <div class="modal_btns">
          <button class="btn_outline" @click="step = 1" :disabled="submitting">이전</button>
          <button class="btn_primary" @click="submit" :disabled="submitting">완료 처리</button>
        </div>
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
.modal_header h3 { font-size: 16px; font-weight: 700; }
.x_btn { background: none; border: none; font-size: 22px; color: var(--gray); cursor: pointer; }

.step { display: flex; flex-direction: column; gap: 12px; }
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

.next_btn { width: 100%; padding: 12px 0; margin-top: 4px; }

.inp {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 13px;
}
.caption { font-size: 11px; color: var(--gray-light); }

.modal_btns { display: flex; gap: 8px; margin-top: 4px; }
.modal_btns > button { flex: 1; padding: 11px 0; font-size: 14px; border-radius: var(--radius-md); cursor: pointer; }
.btn_outline {
  background: var(--white);
  color: var(--gray-dark);
  border: 1.5px solid var(--border);
  font-weight: 600;
}
.btn_outline:hover:not(:disabled) { background: var(--bg); }
</style>
