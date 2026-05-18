import axios from '@/services/httpRequester'

/**
 * 라이더 배달내역 — R9 GET /api/rider/order/completed.
 * 기간 미지정 시 최근 30일 (REQ-RDR-003 박제).
 *
 * @param {string|null} from YYYY-MM-DD
 * @param {string|null} to   YYYY-MM-DD
 */
class OrderHistoryService {
  async getCompleted(from = null, to = null) {
    const params = {}
    if (from) params.from = from
    if (to) params.to = to
    const res = await axios.get('/rider/order/completed', { params })
    return res.data.resultData
  }
}

export default new OrderHistoryService()
