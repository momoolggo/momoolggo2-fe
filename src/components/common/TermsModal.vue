<script setup>
import { ref, watch } from 'vue'
import adminService from '@/services/adminService'

/**
 * 작업 C (2026-05-18) — 회원가입 약관 본문 모달 공통.
 * 3 signup 화면(Customer/Owner/Rider)에서 inline 코드 중복 회피.
 * type prop: '이용약관' / '개인정보' / '마케팅' (DB type 한글 일관 — my_mmg_admin.policy 실측).
 */

const props = defineProps({
  type: { type: String, default: null },
  show: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const policy = ref(null)
const loading = ref(false)

watch(() => [props.show, props.type], async ([newShow, newType]) => {
  if (!newShow || !newType) return
  loading.value = true
  policy.value = null
  try {
    const res = await adminService.getPolicyList(newType, true)
    const list = Array.isArray(res?.resultData) ? res.resultData
                : Array.isArray(res) ? res : []
    policy.value = list.length > 0 ? list[0] : null
  } catch {
    policy.value = null
  } finally {
    loading.value = false
  }
}, { immediate: false })
</script>

<template>
  <div v-if="show" class="modal_overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal_header">
        <h3 class="modal_title">{{ policy?.title ?? type ?? '약관' }}</h3>
        <button class="modal_close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal_body">
        <p v-if="loading" class="msg">로딩 중...</p>
        <p v-else-if="!policy" class="msg">약관을 불러올 수 없습니다.</p>
        <p v-else class="content">{{ policy.content }}</p>
      </div>
      <div class="modal_btns">
        <button class="confirm_btn" @click="$emit('close')">확인</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal_overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: #fff; border-radius: 14px; width: 480px; max-width: 92vw;
  max-height: 80vh; display: flex; flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18); overflow: hidden;
}
.modal_header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; border-bottom: 1px solid #eee;
}
.modal_title { font-size: 16px; font-weight: 700; color: #222; margin: 0; }
.modal_close {
  background: none; border: none; font-size: 18px; color: #999; cursor: pointer;
}
.modal_close:hover { color: #333; }
.modal_body {
  padding: 18px 22px; flex: 1; overflow-y: auto;
}
.msg { font-size: 13px; color: #888; text-align: center; padding: 24px; margin: 0; }
.content {
  font-size: 13px; color: #333; line-height: 1.7;
  white-space: pre-wrap; margin: 0;
}
.modal_btns {
  display: flex; justify-content: flex-end; padding: 12px 22px 18px;
  border-top: 1px solid #f0f0f0;
}
.confirm_btn {
  padding: 8px 22px; border: none; background: #9b1b1b; border-radius: 8px;
  font-size: 13px; color: #fff; cursor: pointer; font-weight: 600;
}
.confirm_btn:hover { background: #7f1515; }
</style>
