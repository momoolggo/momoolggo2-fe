import axios from '@/services/httpRequester'

/**
 * 라이더 근무 세션 — R8 4 endpoint.
 *
 * - PUT  /rider/status                       ACTIVE↔EATING 토글 (RiderController)
 * - POST /rider/work-session/end             업무 종료
 * - GET  /rider/work-session/today           오늘 운행 기록
 * - GET  /rider/work-session/summary?period= today|week 합계
 */
class WorkSessionService {
  async toggleStatus(to) {
    const res = await axios.put('/rider/status', { to })
    return res.data.resultData
  }

  async end() {
    const res = await axios.post('/rider/work-session/end')
    return res.data.resultData
  }

  async getToday() {
    const res = await axios.get('/rider/work-session/today')
    return res.data.resultData
  }

  async getSummary(period = 'today') {
    const res = await axios.get('/rider/work-session/summary', { params: { period } })
    return res.data.resultData
  }
}

export default new WorkSessionService()
