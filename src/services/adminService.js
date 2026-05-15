import axios from '@/services/httpRequester'

class AdminService {
    #url = 'http://localhost:8083/api/admin';

    // 대시보드
    async getDashboard() {
        const res = await axios.get(`${this.#url}/dashboard`);
        return res.data;
    }

    // FAQ
    async getFaqList(type = null) {
        const params = {};
        if (type) params.type = type;
        const res = await axios.get(`${this.#url}/cs/faq`, { params });
        return res.data;
    }

    async createFaq(data) {
        const res = await axios.post(`${this.#url}/cs/faq`, data);
        return res.data;
    }

    async updateFaq(faqId, data) {
        const res = await axios.put(`${this.#url}/cs/faq/${faqId}`, data);
        return res.data;
    }

    async deleteFaq(faqId) {
        const res = await axios.delete(`${this.#url}/cs/faq/${faqId}`);
        return res.data;
    }

    async toggleFaqVisible(faqId) {
        const res = await axios.patch(`${this.#url}/cs/faq/${faqId}/visible`);
        return res.data;
    }

    // CS 문의
    async getCsSummary() {
        const res = await axios.get(`${this.#url}/cs/summary`);
        return res.data;
    }

    async getInquiryList(category = null, state = null) {
        const params = {};
        if (category) params.category = category;
        if (state) params.state = state;
        const res = await axios.get(`${this.#url}/cs/inquiry`, { params });
        return res.data;
    }

    async getInquiryDetail(inquiryId) {
        const res = await axios.get(`${this.#url}/cs/inquiry/${inquiryId}`);
        return res.data;
    }

    async replyInquiry(inquiryId, data) {
        const res = await axios.post(`${this.#url}/cs/inquiry/${inquiryId}/reply`, data);
        return res.data;
    }

    // 정산
    async getSettlementSummary() {
        const res = await axios.get(`${this.#url}/settlement/summary`);
        return res.data;
    }

    async getSettlementList(params = {}) {
        const res = await axios.get(`${this.#url}/settlement`, { params });
        return res.data;
    }

    async getSettlementDetail(settlementId) {
        const res = await axios.get(`${this.#url}/settlement/${settlementId}`);
        return res.data;
    }

    async completeSettlement(settlementId) {
        const res = await axios.patch(`${this.#url}/settlement/${settlementId}/complete`);
        return res.data;
    }

    async holdSettlement(settlementId) {
        const res = await axios.patch(`${this.#url}/settlement/${settlementId}/hold`);
        return res.data;
    }

    // 리뷰,블라인드
    async getBlindList(status = null) {
        const params = {};
        if (status) params.status = status;
        const res = await axios.get(`${this.#url}/blind`, { params });
        return res.data;
    }

    async getBlindDetail(blindId) {
        const res = await axios.get(`${this.#url}/blind/${blindId}`);
        return res.data;
    }

    async blindReview(data) {
        const res = await axios.post(`${this.#url}/blind`, data);
        return res.data;
    }

    async confirmBlind(blindId) {
        const res = await axios.patch(`${this.#url}/blind/${blindId}/confirm`);
        return res.data;
    }

    async releaseBlind(blindId) {
        const res = await axios.patch(`${this.#url}/blind/${blindId}/release`);
        return res.data;
    }

    async suspendUser(blindId) {
        const res = await axios.patch(`${this.#url}/blind/${blindId}/suspend`);
        return res.data;
    }

    async permanentSuspend(blindId) {
        const res = await axios.patch(`${this.#url}/blind/${blindId}/permanent`);
        return res.data;
    }

    // 정책
    async getPolicyList(type = null, isActive = null) {
        const params = {};
        if (type) params.type = type;
        if (isActive !== null) params.isActive = isActive;
        const res = await axios.get(`${this.#url}/policy`, { params });
        return res.data;
    }

    async createPolicy(data) {
        const res = await axios.post(`${this.#url}/policy`, data);
        return res.data;
    }

    async updatePolicy(policyId, data) {
        const res = await axios.put(`${this.#url}/policy/${policyId}`, data);
        return res.data;
    }

    async deactivatePolicy(policyId) {
        const res = await axios.put(`${this.#url}/policy/${policyId}/deactivate`);
        return res.data;
    }

    // 배달 관제
    async getDeliveryMonitor(status = null, page = 0) {
        const params = { page };
        if (status) params.status = status;
        const res = await axios.get(`${this.#url}/delivery/monitor`, { params });
        return res.data;
    }

    async getRiderCount() {
        const res = await axios.get(`${this.#url}/delivery/rider-count`);
        return res.data;
    }

    async sendRiderNotice(payload) {
        const res = await axios.post(`${this.#url}/delivery/notice`, payload);
        return res.data;
    }

    async getNoticeList() {
        const res = await axios.get(`${this.#url}/delivery/notice`);
        return res.data;
    }

    async updateNotice(noticeId, payload) {
        const res = await axios.put(`${this.#url}/delivery/notice/${noticeId}`, payload);
        return res.data;
    }

    async deleteNotice(noticeId) {
        const res = await axios.delete(`${this.#url}/delivery/notice/${noticeId}`);
        return res.data;
    }

    // 회원 관리
    async getUserList(role = null, page = 0) {
        const params = {}
        params['page'] = page
        if (role) params['role'] = role
        const res = await axios.get(`${this.#url}/user`, { params })
        return res.data
    }
    
    async getPendingUsers() {
        const res = await axios.get(`${this.#url}/user/pending`)
        return res.data
    }

    async updateApproval(userNo, status, reason = null) {
        const res = await axios.patch(`${this.#url}/user/${userNo}/approval`, { status, reason })
        return res.data
    }

    async suspendUserByAdmin(userNo, days, reason = null) {
        const res = await axios.patch(`${this.#url}/user/${userNo}/suspension`, { days, reason })
        return res.data
    }

    async releaseSuspension(userNo) {
        const res = await axios.patch(`${this.#url}/user/${userNo}/suspension/release`)
        return res.data
    }

    async getMemberAddress(userNo) {
        const res = await axios.get(`${this.#url}/user/${userNo}/address`)
        return res.data
    }

    async getStoreList(params = {}) {
        const res = await axios.get(`${this.#url}/store`, { params })
        return res.data
    }

    async getStoreDetail(storeId) {
        const res = await axios.get(`${this.#url}/store/${storeId}`)
        return res.data
    }

    async getStoreLocation(userNo) {
        const res = await axios.get(`${this.#url}/user/${userNo}/store-location`)
        return res.data
    }

    async getAllReviews(page = 0, size = 15) {
        const res = await axios.get(`${this.#url}/review`, { params: { page, size } })
        return res.data
    }

    async getChartStats(period = 'weekly', metric = 'memberCount') {
        const res = await axios.get(`${this.#url}/dashboard/chart`, { params: { period, metric } })
        return res.data
      }

      async getUserDetail(userNo) {
        const res = await axios.get(`${this.#url}/user/${userNo}/detail`)
        return res.data
    }



 }

export default new AdminService();