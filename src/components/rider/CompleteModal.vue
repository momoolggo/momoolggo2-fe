<script setup>
import { ref, onUnmounted } from 'vue'
import deliveryService from '@/services/deliveryService'
import RiderDeliveryMap from '@/components/rider/RiderDeliveryMap.vue'
import { showAlert } from '@/composables/useAlert'

const props = defineProps({
  deliveryNo: { type: String, required: true },
  // Figma 박제 170148 — 전달완료 모달 + 지도 (배달지 좌표만 표시)
  deliveryLat: { type: Number, default: null },
  deliveryLng: { type: Number, default: null },
})
const emit = defineEmits(['close', 'completed'])

// 1단계: 전달 방식 선택. 2단계: 사진(선택) + 완료.
const step = ref(1)
const method = ref(null)         // 'DIRECT' | 'CUSTOMER_REQUEST' | 'CUSTOMER_ABSENT'
const photoUrl = ref(null)       // 업로드 성공 시 main이 반환한 URL
const photoPreview = ref(null)   // 미리보기 (브라우저 ObjectURL)
const uploading = ref(false)
const submitting = ref(false)
const fileInputRef = ref(null)

const methodOptions = [
  { key: 'DIRECT',           label: '고객에게 직접 전달했습니다' },
  { key: 'CUSTOMER_REQUEST', label: '고객 요청 위치에 두었습니다' },
  { key: 'CUSTOMER_ABSENT',  label: '고객 부재 — 안전한 곳에 두었습니다' },
]

const goNext = () => {
  if (!method.value) return
  step.value = 2
}

// 자잘 에러 트랙 #9 (2026-05-23) — 파일 선택 즉시 업로드 후 URL 받음
const onFileSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    await showAlert('이미지 파일만 업로드 가능합니다.', { title: '파일 형식 오류', type: 'warning' })
    return
  }
  // 미리보기 즉시 표시 (업로드 전이라도)
  photoPreview.value = URL.createObjectURL(file)
  uploading.value = true
  try {
    photoUrl.value = await deliveryService.uploadDeliveryPhoto(file)
  } catch (err) {
    await showAlert(err.response?.data?.resultMessage ?? '사진 업로드에 실패했습니다.', { title: '업로드 실패', type: 'error' })
    photoPreview.value = null
    photoUrl.value = null
  } finally {
    uploading.value = false
  }
}

const removePhoto = () => {
  // reviewer W-2 정정 — ObjectURL leak 차단 (반복 사용 시 메모리 누적 방지)
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value)
  photoUrl.value = null
  photoPreview.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

onUnmounted(() => {
  // reviewer W-2 정정 — 컴포넌트 소멸 시 미해제 ObjectURL revoke
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value)
})

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
    await showAlert(err.response?.data?.resultMessage ?? '완료 처리에 실패했습니다.', { title: '완료 실패', type: 'error' })
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

      <!-- Step 1: 전달 방식 선택 (Image 170148 모달 패턴, case-#31 정정 - 170143은 InProgress 분기) -->
      <div v-if="step === 1" class="step">
        <RiderDeliveryMap
          v-if="deliveryLat && deliveryLng"
          :delivery-lat="deliveryLat"
          :delivery-lng="deliveryLng"
          height="160px"
        />
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

        <div v-if="!photoPreview" class="upload_area" @click="fileInputRef?.click()">
          <span class="upload_icon">📷</span>
          <span class="upload_text">사진 선택</span>
        </div>
        <div v-else class="photo_preview_wrap">
          <img :src="photoPreview" alt="배달 완료 사진" class="photo_preview" />
          <button class="remove_photo_btn" @click="removePhoto" :disabled="uploading || submitting">✕</button>
          <span v-if="uploading" class="uploading_overlay">업로드 중...</span>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          style="display: none"
          @change="onFileSelect"
        />

        <div class="modal_btns">
          <button class="btn_outline" @click="step = 1" :disabled="submitting || uploading">이전</button>
          <button class="btn_primary" @click="submit" :disabled="submitting || uploading">완료 처리</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal_backdrop {
  position: absolute; inset: 0;
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
  max-height: 90vh; /* C-5 정정 — 소형 폰 (320px 미만) 잘림 회피 */
  overflow-y: auto;
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

/* 자잘 에러 트랙 #9 (2026-05-23) — 파일 업로드 UI */
.upload_area {
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  padding: 32px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--gray);
  transition: all 0.15s;
}
.upload_area:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}
.upload_icon { font-size: 28px; }
.upload_text { font-size: 14px; font-weight: 600; }

.photo_preview_wrap {
  position: relative;
  width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
}
.photo_preview {
  width: 100%;
  max-height: 240px;
  object-fit: cover;
  display: block;
}
.remove_photo_btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
}
.remove_photo_btn:disabled { opacity: 0.5; cursor: not-allowed; }
.uploading_overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

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
