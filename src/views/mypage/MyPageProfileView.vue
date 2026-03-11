<script setup>
import { reactive, onMounted } from 'vue'
import axios from 'axios'

const state = reactive({
  form: {
    userId: '',
    name: '',
    userPw: '',
    userPwConfirm: '',
    tel: '',
    gender: null,
    birth: '',
  },
  showPw: false,
  showPwConfirm: false,
  errorMsg: '',
  successMsg: '',
})

// 내 정보 불러오기
onMounted(async () => {
  try {
    const res = await axios.get('/api/user')
    const d = res.data.resultData
    state.form.userId = d.userId ?? ''
    state.form.name   = d.name   ?? ''
    state.form.tel    = d.tel    ?? ''
    state.form.gender = d.gender ?? null
    state.form.birth  = d.birth  ?? ''
  } catch {
    state.errorMsg = '정보를 불러오는 데 실패했습니다.'
  }
})

const update = async () => {
  if (!state.form.name) {
    state.errorMsg = '이름을 입력해 주세요.'
    return
  }
  if (state.form.userPw && state.form.userPw !== state.form.userPwConfirm) {
    state.errorMsg = '비밀번호가 일치하지 않습니다.'
    return
  }
  try {
    state.errorMsg  = ''
    state.successMsg = ''
    await axios.put('/api/user', {
      name:   state.form.name,
      userPw: state.form.userPw || null,
      tel:    state.form.tel,
      gender: state.form.gender,
      birth:  state.form.birth || null,
    })
    state.successMsg = '수정이 완료되었습니다.'
    state.form.userPw = ''
    state.form.userPwConfirm = ''
  } catch (err) {
    state.errorMsg = err.response?.data?.resultMessage ?? '수정에 실패했습니다.'
  }
}
</script>

<template>
  <div class="profile_wrap">
    <h2 class="page_title">내 정보 수정</h2>

    <div class="form_card">

      <!-- 아이디 (읽기 전용) -->
      <div class="field">
        <label class="label">아이디</label>
        <input :value="state.form.userId" type="text" class="inp readonly" readonly />
      </div>

      <!-- 이름 -->
      <div class="field">
        <label class="label">이름 <span class="required">*</span></label>
        <input v-model="state.form.name" type="text" class="inp" placeholder="이름" />
      </div>

      <!-- 새 비밀번호 -->
      <div class="field">
        <label class="label">새 비밀번호 <span class="optional">(선택)</span></label>
        <div class="input_wrap">
          <input
            v-model="state.form.userPw"
            :type="state.showPw ? 'text' : 'password'"
            class="inp"
            placeholder="변경할 비밀번호 입력"
          />
          <button class="pw_toggle" @click="state.showPw = !state.showPw">
            <i :class="state.showPw ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
          </button>
        </div>
      </div>

      <!-- 비밀번호 확인 -->
      <div class="field" v-if="state.form.userPw">
        <label class="label">비밀번호 확인</label>
        <div class="input_wrap">
          <input
            v-model="state.form.userPwConfirm"
            :type="state.showPwConfirm ? 'text' : 'password'"
            class="inp"
            placeholder="비밀번호 확인"
          />
          <button class="pw_toggle" @click="state.showPwConfirm = !state.showPwConfirm">
            <i :class="state.showPwConfirm ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
          </button>
        </div>
      </div>

      <!-- 연락처 -->
      <div class="field">
        <label class="label">연락처</label>
        <input v-model="state.form.tel" type="tel" class="inp" placeholder="010-0000-0000" />
      </div>

      <!-- 성별 -->
      <div class="field">
        <label class="label">성별 <span class="optional">(선택)</span></label>
        <div class="radio_group">
          <label class="radio_label">
            <input v-model="state.form.gender" type="radio" :value="1" /> 남
          </label>
          <label class="radio_label">
            <input v-model="state.form.gender" type="radio" :value="2" /> 여
          </label>
        </div>
      </div>

      <!-- 생년월일 -->
      <div class="field">
        <label class="label">생년월일 <span class="optional">(선택)</span></label>
        <input v-model="state.form.birth" type="date" class="inp" />
      </div>

      <p v-if="state.errorMsg"   class="error_msg">{{ state.errorMsg }}</p>
      <p v-if="state.successMsg" class="success_msg">{{ state.successMsg }}</p>

      <button class="btn_primary" @click="update">수정하기</button>

    </div>
  </div>
</template>

<style scoped>
.profile_wrap {
  max-width: 520px;
  margin: 40px auto;
  padding: 0 16px;
}
.page_title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
}
.form_card {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.inp.readonly {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}
.success_msg {
  color: #16a34a;
  font-size: 13px;
  text-align: center;
}
.radio_group {
  display: flex;
  gap: 20px;
}
.radio_label {
  font-size: 14px;
  color: var(--gray-dark);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>