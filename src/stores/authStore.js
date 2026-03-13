import { defineStore } from 'pinia'
import { reactive } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const state = reactive({
    isSignedIn: false,
    userNo: null,
    name: '',
    role: '',
    atExpiresAt: null,  // ← 추가: AT 만료 시각 (ms)
  })

  // 로그인 상태 확인 (앱 시작 시 호출)
  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/user/me')
      const d = res.data.resultData
      if (d) {
        state.isSignedIn = true
        state.userNo = d.userNo
        state.name   = d.name
        state.role   = d.role
        // AT 만료시간은 me에서 못 가져옴 → 타이머 시작 안 함
        // 새로고침 시 모달은 안 뜸 (감수)
      } else {
        reset()
      }
    } catch {
      reset()
    }
  }

  // 로그인 성공 시 호출 — AT 15분 기준으로 만료시각 저장
  const signIn = (data) => {
    state.isSignedIn = true
    state.userNo = data.userNo
    state.name   = data.name
    state.role   = data.role
    state.atExpiresAt = data.atExpiresAt  // ← 추가
  }

  // reissue 성공 시 만료시각 갱신
  const refreshExpiry = () => {
  state.atExpiresAt = Date.now() + 15 * 24 * 60 * 60 * 1000  // ← 추가
  }

  const signOut = () => { reset() }

  const reset = () => {
    state.isSignedIn = false
    state.userNo = null
    state.name   = ''
    state.role   = ''
    state.atExpiresAt = null  // ← 추가
  }

  return { state, checkAuth, signIn, signOut, refreshExpiry }
})