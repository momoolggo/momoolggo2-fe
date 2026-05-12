import axios from '@/services/httpRequester'

/**
 * 라이더 공지 — R9 GET /api/rider/notice.
 * target_type IN (ALL, RIDER) + published_at <= now 자동 필터 (서버 측).
 */
class NoticeService {
  async getNotices() {
    const res = await axios.get('/rider/notice')
    return res.data.resultData
  }
}

export default new NoticeService()
