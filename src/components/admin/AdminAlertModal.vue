<script setup>
defineProps({ show: Boolean, message: String })
defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal_overlay" @click.self="$emit('close')">
      <div class="alert_modal">
        <p class="alert_msg">{{ message }}</p>
        <button class="alert_confirm_btn" @click="$emit('close')">확인</button>
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
.alert_modal {
  background: #fff;
  border-radius: 14px;
  padding: 36px 40px;
  width: 320px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}
.alert_msg {
  font-size: 15px;
  color: #333;
  line-height: 1.7;
  margin: 0 0 24px;
  font-family: 'Noto Sans KR', sans-serif;
}
.alert_confirm_btn {
  background: #9b1b1b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 40px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Noto Sans KR', sans-serif;
}
.alert_confirm_btn:hover { background: #7f1515; }
</style>
