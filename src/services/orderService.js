import axios from '@/services/httpRequester'

class OrderService {
    #url = '/order';

    // 주문 화면 초기 데이터 조회
    async getOrderInfo() {
        const res = await axios.get(this.#url);
        return res.data;
    }

    // 주문 확정
    async placeOrder(orderData) {
        const res = await axios.post(this.#url, orderData);
        return res.data;
    }
    // 토스 결제 승인 요청
    async confirmPayment(paymentData) {
    const res = await axios.post('/payment/confirm', paymentData);
        return res.data;
}

    // 주문 내역 조회 (마이페이지)
    async getOrderHistory(params) {
        const res = await axios.get(`${this.#url}/history`, { params });
        return res.data;
    }

     // 주문 상세 조회 (마이페이지)
    async getOrderDetail(orderId) {
        const res = await axios.get(`${this.#url}/history/${orderId}`);
        return res.data;
    }

    //주문 취소
    async cancelOrder(orderId, cancelData) {
        const res = await axios.put(`${this.#url}/${orderId}/cancel`, cancelData)
        return res.data;
    }

    //주문내역 맥스페이지
    async getMaxHistory(userId) {
        const res = await axios.get(`${this.#url}/history/max/${userId}`);
        return res.data;
    }

    //취소된 주문 건 재주문 (장바구니 다시 담기)
    async reorder(orderId) {
        const res = await axios.post(`${this.#url}/${orderId}/reorder`);
        return res.data;
    }

    // 실시간 배달 현황 조회
    async getOrderStatus(orderId) {
        const res = await axios.get(`${this.#url}/${orderId}/status`);
        return res.data;
    }

}
export default new OrderService();
