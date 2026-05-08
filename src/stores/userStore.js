import { defineStore } from 'pinia'
import { reactive } from 'vue'
import userService from '@/services/userService'

export const useUserStore = defineStore('user', () => {

    const state = reactive({
        isSignedIn: false,
        userNo: null,
        name: '',
        role: '',             // 'OWNER' | 'CUSTOMER' | 'RIDER'
        atExpiresAt: null,    // AT 만료 시각 (ms)
        isLoading: true,      // 앱 최초 로드 시 /me 호출 전까지 true
    })

    // ── 앱 시작 / 새로고침 시 쿠키로 로그인 상태 복원
    const checkAuth = async () => {
        state.isLoading = true
        try {
            const data = await userService.getMe()
            if (data) {
                state.isSignedIn = true
                state.userNo = data.userNo
                state.name = data.name
                state.role = data.role
                // 새로고침 시 AT 만료시각은 알 수 없으므로 null 유지
                state.atExpiresAt = null
            } else {
                reset()
            }
        } catch {
            reset()
        } finally {
            state.isLoading = false
        }
    }

    // ── 로그인 성공 시 호출
    // 응답: { userNo, name, role, accessTokenExpiry }
    const signIn = (data) => {
        state.isSignedIn = true
        state.userNo = data.userNo
        state.name = data.name
        state.role = data.role
        state.atExpiresAt = data.accessTokenExpiry
    }

    // ── 로그아웃
    const signOut = async () => {
        try {
            await userService.signout()
        } finally {
            reset()
        }
    }

    // ── reissue 성공 시 만료시각 갱신
    const refreshExpiry = () => {
        state.atExpiresAt = Date.now() + 15 * 60 * 1000  // AT 15분 기준
    }

    // ── 상태 초기화
    const reset = () => {
        state.isSignedIn = false
        state.userNo = null
        state.name = ''
        state.role = ''
        state.atExpiresAt = null
        state.isLoading = false
    }

    

    return { state, checkAuth, signIn, signOut, refreshExpiry }
})