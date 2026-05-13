import axios from 'axios'
import userService from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import { useMessageModalStore } from '@/stores/messageModalStore'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  res => res,
  async err => {
    const userStore = useUserStore()
    const messageModalStore = useMessageModalStore()

    if (err.response) {
      const { status, config, data } = err.response

      // /user/reissue 자체가 실패 = RT 만료 → 로그아웃
      if (config.url === '/user/reissue' && status === 500) {
        await userStore.signOut()
        messageModalStore.setMessage('세션이 만료되었습니다. 다시 로그인해주세요.')
        return Promise.reject(err)
      }

      // 401 + 로그인 상태 = AT 만료 → 재발급 후 원 요청 재시도
      if (status === 401 && userStore.state.isSignedIn) {
        try {
          await userService.reissue()
          userStore.refreshExpiry()
          return await http.request(err.config)
        } catch (reissueError) {
          return Promise.reject(reissueError)
        }
      }

      const message = data?.resultMessage || data?.message
      if (message) {
        messageModalStore.setMessage(message)
      }
    } else if (err.request) {
      messageModalStore.setMessage('서버와 통신할 수 없습니다. 네트워크 상태를 확인해주세요.')
    } else {
      messageModalStore.setMessage('요청 중 알 수 없는 오류가 발생했습니다.')
    }

    return Promise.reject(err)
  }
)

export default axios
