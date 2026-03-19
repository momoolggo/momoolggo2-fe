<script setup>
import { reactive, ref } from 'vue'
import { showAlert } from '@/composables/useAlert'

const state = reactive({
  form: {
    storeName: '',
    name: '',
    tel: '',
    email: '',
    address: '',
    message: '',
  },
  submitted: false,
})

const submit = async () => {
  if (!state.form.storeName || !state.form.name || !state.form.tel) {
    await showAlert('필수 항목을 입력해 주세요.', { title: '입력 필요', type: 'warning' })
    return
  }
  state.submitted = true
}
</script>

<template>
  <div class="info_wrap">
    <h2 class="page_title">사장님 입점문의</h2>

    <div v-if="state.submitted" class="submitted_box">
      <i class="bi bi-check-circle-fill"></i>
      <h3>문의가 접수되었습니다!</h3>
      <p>담당자가 확인 후 영업일 2~3일 내로 연락드리겠습니다.</p>
    </div>

    <div v-else class="info_card">
      <p class="intro">뭐물꼬에 입점하시면 대구·경상도 지역 고객들에게 더 많이 노출될 수 있습니다. 아래 양식을 작성해 주시면 담당자가 연락드리겠습니다.</p>

      <div class="field">
        <label class="label">가게명 <span class="required">*</span></label>
        <input v-model="state.form.storeName" type="text" class="inp" placeholder="가게명을 입력하세요" />
      </div>
      <div class="field">
        <label class="label">담당자 이름 <span class="required">*</span></label>
        <input v-model="state.form.name" type="text" class="inp" placeholder="이름을 입력하세요" />
      </div>
      <div class="field">
        <label class="label">연락처 <span class="required">*</span></label>
        <input v-model="state.form.tel" type="tel" class="inp" placeholder="010-0000-0000" />
      </div>
      <div class="field">
        <label class="label">이메일 <span class="optional">(선택)</span></label>
        <input v-model="state.form.email" type="email" class="inp" placeholder="example@email.com" />
      </div>
      <div class="field">
        <label class="label">가게 주소 <span class="optional">(선택)</span></label>
        <input v-model="state.form.address" type="text" class="inp" placeholder="가게 주소를 입력하세요" />
      </div>
      <div class="field">
        <label class="label">문의 내용 <span class="optional">(선택)</span></label>
        <textarea v-model="state.form.message" class="inp textarea" placeholder="문의하실 내용을 자유롭게 작성해 주세요"></textarea>
      </div>

      <button class="btn_primary" @click="submit">문의하기</button>
    </div>
  </div>
</template>

<style scoped>
.info_wrap { max-width: 600px; margin: 40px auto; padding: 0 16px 60px; }
.page_title { font-size: 22px; font-weight: 700; margin-bottom: 24px; }
.info_card { background: #fff; border-radius: var(--radius-lg); border: 1.5px solid var(--border); padding: 36px; display: flex; flex-direction: column; gap: 16px; }
.intro { font-size: 14px; color: var(--gray-dark); line-height: 1.8; padding-bottom: 16px; border-bottom: 1.5px solid var(--border); }
.textarea { min-height: 120px; resize: vertical; }
.submitted_box { text-align: center; padding: 80px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.submitted_box i { font-size: 56px; color: var(--primary); }
.submitted_box h3 { font-size: 20px; font-weight: 700; }
.submitted_box p { font-size: 14px; color: var(--gray); }
</style>