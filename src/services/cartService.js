import axios from './httpRequester';

class CartService {
    #url = '/cart';

    async addToCart(cartData) { // 장바구니 담기
        const res = await axios.post(`${this.#url}/add`, cartData);
        return res.data;
    }

    async getCartList(userNo) { // 장바구니 목록 조회
        const res = await axios.get(`${this.#url}/${userNo}`);
        return res.data;
    }

    async updateCartItem(id, data) { // 장바구니 수량 변경 (수정된 부분 반영)
        // 위에서 논의한 대로 id는 경로로, data는 바디로 보냅니다.
        const res = await axios.put(`${this.#url}-items/${id}`, data);
        return res.data;
    }

    async deleteCartItem(cartId) { // 장바구니 항목 삭제
        const res = await axios.delete(`${this.#url}/${cartId}`);
        return res.data;
    }

    async clearCart() { // 장바구니 전체 비우기
        const res = await axios.delete(`${this.#url}/clear`);
        return res.data;
    }
    
    async clearAndAdd(cartData) {
      const res = await axios.post(`${this.#url}/clear-and-add`, cartData);
      return res.data;
  }
}

export default new CartService();
