<script setup>
import { ref } from 'vue'

const visible = ref(false)
const title = ref('')
const message = ref('')
const type = ref('success')
const confirmMode = ref(false)
const resolvePromise = ref(null)

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
}

const show = (msg, options = {}) => {
  message.value = msg
  title.value = options.title || ''
  type.value = options.type || 'success'
  confirmMode.value = false
  visible.value = true
  return new Promise((resolve) => { resolvePromise.value = resolve })
}

const confirm = (msg, options = {}) => {
  message.value = msg
  title.value = options.title || ''
  type.value = options.type || 'warning'
  confirmMode.value = true
  visible.value = true
  return new Promise((resolve) => { resolvePromise.value = resolve })
}

const handleConfirm = () => {
  visible.value = false
  resolvePromise.value?.(true)
  resolvePromise.value = null
}

const handleCancel = () => {
  visible.value = false
  confirmMode.value = false
  resolvePromise.value?.(false)
  resolvePromise.value = null
}

const close = () => {
  visible.value = false
  resolvePromise.value?.(true)
  resolvePromise.value = null
}

defineExpose({ show, confirm })
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="alert-overlay" @click.self="confirmMode ? null : close()">
        <div class="alert-box">
          <div class="alert-icon">
            <span :class="type">{{ icons[type] }}</span>
          </div>
          <h3 v-if="title" class="alert-title">{{ title }}</h3>
          <p class="alert-message">{{ message }}</p>
          <div class="alert-btns">
            <template v-if="confirmMode">
              <button class="alert-btn cancel-btn" @click="handleCancel">취소</button>
              <button class="alert-btn confirm-btn" @click="handleConfirm">확인</button>
            </template>
            <template v-else>
              <button class="alert-btn confirm-btn full" @click="close">확인</button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.alert-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
}
.alert-box {
  background: #fff;
  border-radius: 20px;
  padding: 36px 32px 28px;
  width: 340px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  animation: alert-pop 0.25s ease-out;
}
@keyframes alert-pop {
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.alert-icon { margin-bottom: 16px; font-size: 48px; }
.alert-title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px; }
.alert-message { font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 28px; word-break: keep-all; white-space: pre-line; }
.alert-btns { display: flex; gap: 10px; }
.alert-btn {
  flex: 1;
  padding: 14px 0;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.alert-btn:hover { opacity: 0.85; }
.confirm-btn { background: #2ac1bc; color: #fff; }
.cancel-btn { background: #f5f5f5; color: #666; }
.alert-btn.full { width: 100%; }
.modal-enter-active { transition: opacity 0.2s; }
.modal-leave-active { transition: opacity 0.15s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>