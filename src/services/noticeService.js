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

  /**
   * 신규 공지 SSE 구독 — 2026-05-28 트랙. deliveryService.subscribeStream 박제 일관.
   * NOW + ALL/RIDER 가시성 공지가 admin이 작성된 직후 트랜잭션 commit 후 푸시됨.
   * @param {(row: { noticeNo: number, category: string, title: string, content: string, publishedAt: string }) => void} onNewNotice
   * @returns {EventSource} close() 호출용
   */
  subscribeStream(onNewNotice) {
    const baseURL = axios.defaults.baseURL || ''
    const url = `${baseURL}/rider/notice/stream`
    const es = new EventSource(url, { withCredentials: true })
    es.addEventListener('notice-new', (e) => {
      try {
        onNewNotice(JSON.parse(e.data))
      } catch (err) {
        console.error('SSE notice-new 파싱 실패', err)
      }
    })
    es.onerror = (e) => {
      console.warn('notice SSE 연결 일시 오류 (자동 재연결)', e)
    }
    return es
  }
}

export default new NoticeService()
