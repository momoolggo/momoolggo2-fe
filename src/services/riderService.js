import axios from '@/services/httpRequester'

class RiderService {
  #url = '/rider'

  // ── 라이더 프로필 등록/수정 PUT /api/rider/profile
  // 응답: ResultResponse<RiderProfileRes> → resultData
  async putProfile(profileData) {
    const res = await http.put(`${this.#url}/profile`, profileData)
    return res.data.resultData
  }

  // ── 본인 라이더 프로필 조회 GET /api/rider/me
  // 응답: ResultResponse<RiderProfileRes> → resultData
  async getMe() {
    const res = await http.get(`${this.#url}/me`)
    return res.data.resultData
  }
}

export default new RiderService()
