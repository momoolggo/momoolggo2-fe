import axios from '@/services/httpRequester'

/**
 * 2026-05-25 9건 트랙 #8 부채 Step B — 출석 시스템 FE 서비스.
 * BE AttendanceController endpoint 2개.
 */
class AttendanceService {
  #url = '/attendance'

  /** 오늘 출석 체크 — idempotent (이미 체크되어도 200 OK + alreadyChecked=true) */
  async check() {
    const res = await axios.post(`${this.#url}/check`)
    return res.data.resultData
  }

  /** 이번달 출석 캘린더 — year/month 생략 시 이번달 기본 */
  async getCalendar(year, month) {
    const params = {}
    if (year) params.year = year
    if (month) params.month = month
    const res = await axios.get(`${this.#url}/calendar`, { params })
    return res.data.resultData
  }
}

export default new AttendanceService()
