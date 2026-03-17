import axios from 'axios';

class AddressService {
    #url = '/user/address';

    // 주소 추가
    async save(addressData) {
        const res = await axios.post(this.#url, addressData);
        return res.data;
    }

    // 주소 목록 조회
    async findAll() {
    const res = await axios.get(this.#url);
    return res.data.resultData;
    }

    // 주소 수정
    async update(addressData) {
        const res = await axios.put(this.#url, addressData);
        return res.data;
    }

    // 주소 삭제
    async delete(addressId) {
        const res = await axios.delete(`${this.#url}/${addressId}`);
        return res.data;
    }

    // 기본 배송지 설정
    async setDefault(addressId) {
    const res = await axios.put(`${this.#url}/${addressId}/default`);
    return res.data;
    }
}

export default new AddressService();