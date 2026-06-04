<script setup>
defineProps({ show: Boolean, message: String })
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal_overlay" @click.self="$emit('cancel')">
      <div class="confirm_modal">
        <p class="confirm_msg">{{ message }}</p>
        <div class="confirm_btns">
          <button class="btn_cancel" @click="$emit('cancel')">취소</button>
          <button class="btn_confirm" @click="$emit('confirm')">확인</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal_overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
}
.confirm_modal {
  background: #fff;
  border-radius: 14px;
  padding: 36px 40px;
  width: 320px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}
.confirm_msg {
  font-size: 15px;
  color: #333;
  line-height: 1.7;
  margin: 0 0 28px;
  white-space: pre-line;
  font-family: 'Noto Sans KR', sans-serif;
}
.confirm_btns { display: flex; gap: 10px; justify-content: center; }
.btn_cancel {
  flex: 1;
  padding: 10px 0;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Noto Sans KR', sans-serif;
}
.btn_cancel:hover { background: #f5f5f5; }
.btn_confirm {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: #9b1b1b;
  border-radius: 8px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  font-family: 'Noto Sans KR', sans-serif;
}
.btn_confirm:hover { background: #7f1515; }
</style>
