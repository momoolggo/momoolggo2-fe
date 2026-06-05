import axios from 'axios'
import userService from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import { useMessageModalStore } from '@/stores/messageModalStore'
import router from '@/router'

axios.interceptors.response.use(
  res => res,
  async err => {
    const userStore = useUserStore()
    const messageModalStore = useMessageModalStore()

    if (err.response) {
      const { status, config, data } = err.response

      // reissue 자체가 401 = RT 만료 → 로그인 페이지로 이동 (로그인 중이었을 때만)
      if (config.url === '/user/reissue' && status === 401) {
        const role = userStore.state.role
        userStore.reset()
        if (role) redirectToSignin(role)
        return Promise.reject(err)
      }

      // 로그인/회원가입/라이더 프로필 등록은 reissue 시도 제외
      const skipReissueUrls = ['/user/login', '/user/join', '/rider/profile']
      // 401 + 미재시도 = AT 만료 → 재발급 후 원 요청 1회 재시도
      if (status === 401 && !config._retry && !skipReissueUrls.includes(config.url)) {
        config._retry = true
        const role = userStore.state.role
        try {
          await userService.reissue()
          userStore.refreshExpiry()
          return await axios.request(config)
        } catch (reissueError) {
          userStore.reset()
          if (role) redirectToSignin(role)
          return Promise.reject(reissueError)
        }
      }

      const isWithdrawRequest = config.url === '/user' && config.method?.toLowerCase() === 'delete'

      // 409는 각 페이지 catch에서 직접 처리 (중복 모달 방지)
      if (status !== 409 && !isWithdrawRequest) {
        const message = data?.resultMessage || data?.message
        if (message) {
          messageModalStore.setMessage(message)
        }
      }
    } else if (err.request) {
      messageModalStore.setMessage('서버와 통신할 수 없습니다. 네트워크 상태를 확인해주세요.')
    } else {
      messageModalStore.setMessage('요청 중 알 수 없는 오류가 발생했습니다.')
    }

    return Promise.reject(err)
  }
)

function redirectToSignin(role) {
  if (role === 'OWNER') router.push('/owner/signin')
  else if (role === 'RIDER') router.push('/rider/signin')
  else if (role === 'ADMIN') router.push('/admin/signin')
  else router.push('/customer/signin')
}

export default axios
