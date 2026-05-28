import axios from '@/services/httpRequester'

class RiderService {
  #url = '/rider'

  // ── 라이더 프로필 등록/수정 PUT /api/rider/profile
  // 응답: ResultResponse<RiderProfileRes> → resultData
  async putProfile(profileData) {
    const res = await axios.put(`${this.#url}/profile`, profileData)
    return res.data.resultData
  }

  // ── 본인 라이더 프로필 조회 GET /api/rider/me
  // 응답: ResultResponse<RiderProfileRes> → resultData
  async getMe() {
    const res = await axios.get(`${this.#url}/me`)
    return res.data.resultData
  }

  /**
   * 가입 면허증 사진 업로드 — 2026-05-28 트랙.
   * 가입 *이전* 호출 (토큰 없음) — main /api/rider-license/upload POST permitAll.
   * owner signup-doc / delivery-photo 박제 일관 (CLAUDE.md §5 main 단독 책임).
   * 반환값 = 저장된 URL (예: "/uploads/rider-license/abc.jpg") — signup putProfile에 licenseImageUrl로 전달.
   */
  async uploadLicense(file) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await axios.post('/rider-license/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.resultData
  }
}

export default new RiderService()
