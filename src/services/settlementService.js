import axios from '@/services/httpRequester'

/**
 * 라이더 정산 — R7.
 *
 * - GET  /rider/settlement?from=&to=    내역
 * - GET  /rider/settlement/account      정산 계좌 조회
 * - PUT  /rider/settlement/account      정산 계좌 변경
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
}

export default new SettlementService()
