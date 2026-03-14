import axios from 'axios';

class CartService {
    #url = '/cart';

    // 장바구니 담기
    async addToCart(cartData) {
        const res = await axios.post(`${this.#url}/add`, cartData);
        return res.data;
    }

    // 장바구니 목록 조회
    async getCartList(userNo) {
        const res = await axios.get(`${this.#url}/${userNo}`);
        return res.data;
    }

    // 장바구니 수량 변경
    async updateCartItem(id, data) {
        const res = await axios.put(`${this.#url}-items/${id}`, data);
        return res.data;
    }

    // 장바구니 항목 삭제
    async deleteCartItem(cartId) {
        const res = await axios.delete(`${this.#url}/${cartId}`);
        return res.data;
    }

    // 장바구니 전체 비우기
    async clearCart() {
        const res = await axios.delete(`${this.#url}/clear`);
        return res.data;
    }

    // 장바구니 비우고 새로 담기
    async clearAndAdd(cartData) {
        const res = await axios.post(`${this.#url}/clear-and-add`, cartData);
        return res.data;
    }
}

export default new CartService();