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

    //주문내역 맥스페이지
    async getMaxHistory(userId) {
      const res = await axios.get(`${this.#url}/history/max/${userId}`);
      return res.data;
  }

}
export default new OrderService();
