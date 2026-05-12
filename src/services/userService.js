import axios from '@/services/httpRequester'

class UserService {
  #url = '/user'

  // ── 아이디 중복확인 GET /api/user/check-id?userId=xxx
  async checkId(userId) {
    const res = await axios.get(`${this.#url}/check-id`, { params: { userId } })
    return res.data // ResultResponse<Void>
  }

  // ── 회원가입 POST /api/user/join
  async signup(signupData) {
    const res = await axios.post(`${this.#url}/join`, signupData)
    return res.data // ResultResponse<Void>
  }

  // ── 로그인 POST /api/user/login
  // 응답: ResultResponse<UserSigninRes> → resultData: { userNo, name, role, accessTokenExpiry }
  async signin(signinData) {
    const res = await axios.post(`${this.#url}/login`, signinData)
    return res.data.resultData // { userNo, name, role, accessTokenExpiry }
  }

  // ── 로그아웃 POST /api/user/logout
  async signout() {
    const res = await axios.post(`${this.#url}/logout`)
    return res.data
  }

  // ── 로그인 상태 복원 GET /api/user/me (새로고침 시 Pinia 복원용)
  // 응답: ResultResponse<UserSigninRes> → resultData: { userNo, name, role }
  async getMe() {
    const res = await axios.get(`${this.#url}/me`)
    return res.data.resultData // { userNo, name, role }
  }

  // ── 내 프로필 조회 GET /api/user
  // 응답: ResultResponse<UserGetRes> → resultData: { userId, name, tel, gender, birth }
  async getUser() {
    const res = await axios.get(this.#url)
    return res.data.resultData
  }

  // ── 내 정보 수정 PUT /api/user
  async updateMe(updateData) {
    const res = await axios.put(this.#url, updateData)
    return res.data
  }

  // ── AT 재발급 POST /api/user/reissue
  async reissue() {
    const res = await axios.post(`${this.#url}/reissue`)
    return res.data
  }

  //리뷰등록
  async postReview(reviewData) {
    const res = await axios.post(`${this.#url}/review`, reviewData)
    return res.data
  }

  //리뷰 조회
  async getReviews(params) {
    const res = await axios.get(`${this.#url}/review`, { params })
    return res.data// 리뷰 데이터 반환
  }

  //리뷰 수정
  async updateReview(reviewId, reviewData) {
    const res = await axios.put(`${this.#url}/review/${reviewId}`, reviewData)
    return res.data
  }

  //리뷰 삭제
  async deleteReview(reviewId) {
    const res = await axios.delete(`${this.#url}/review/${reviewId}`)
    return res.data
  }

  // 리뷰 단건 조회 (수정 시 기존 데이터 불러오기)
    async getReviewDetail(reviewId) {
        const res = await axios.get(`${this.#url}/review/${reviewId}`)
        return res.data
    }
}

export default new UserService()
