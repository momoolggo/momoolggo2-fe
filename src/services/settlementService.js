import axios from '@/services/httpRequester'

/**
 * 라이더 정산 — R7.
 *
 * - GET  /rider/settlement?from=&to=    내역
 * - GET  /rider/settlement/account      정산 계좌 조회
 * - PUT  /rider/settlement/account      정산 계좌 변경
 * - SSE  /rider/settlement/stream       이번 주 정산 자동 푸시 (SSE 자동화 트랙, 2026-05-21)
 */
class SettlementService {
  async history(from = null, to = null) {
    const params = {}
    if (from) params.from = from
    if (to) params.to = to
    const res = await axios.get('/rider/settlement', { params })
    return res.data.resultData
  }

  async getAccount() {
    const res = await axios.get('/rider/settlement/account')
    return res.data.resultData
  }

  async updateAccount(payload) {
    const res = await axios.put('/rider/settlement/account', payload)
    return res.data.resultData
  }

  /**
   * SSE 정산 푸시 구독 — 배달 완료 시 BE에서 자동 UPSERT + push (SSE 자동화 트랙, 2026-05-21).
   * @param {(payload: object) => void} onUpdate 정산 row 수신 콜백 (SettlementRowRes 1건)
   * @returns {EventSource} close() 호출용
   */
  subscribeStream(onUpdate) {
    const baseURL = axios.defaults.baseURL || ''
    const url = `${baseURL}/rider/settlement/stream`
    const es = new EventSource(url, { withCredentials: true })
    es.addEventListener('settlement-updated', (e) => {
      try {
        onUpdate(JSON.parse(e.data))
      } catch (err) {
        console.error('SSE settlement-updated 파싱 실패', err)
      }
    })
    es.onerror = (e) => {
      // EventSource는 자동 재연결. 단순 로깅만.
      console.warn('SSE 연결 일시 오류 (자동 재연결)', e)
    }
    return es
  }
}

export default new SettlementService()
