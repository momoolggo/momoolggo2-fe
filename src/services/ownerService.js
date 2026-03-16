import axios from 'axios';

class OwnerService {
    #url = '/owner';

    // 가게 등록
    async registerStore(storeData) {
        const res = await axios.post(`${this.#url}/store`, storeData);
        return res.data;
    }

    // 가게 기본 정보 수정
    async updateStore(storeData) {
        const res = await axios.put(`${this.#url}/store`, storeData);
        return res.data;
    }

    // 가게 운영정보 수정 (영업중/휴무 등)
    async updateStoreStatus(statusData) {
        const res = await axios.patch(`${this.#url}/store/status`, statusData);
        return res.data;
    }

    // 가게 삭제
    async deleteStore(storeId) {
        const res = await axios.delete(`${this.#url}/store/${storeId}`);
        return res.data;
    }

    // 가게 주문 조회 (state: 주문상태 필터)
    async getOrders(storeId, state) {
    const res = await axios.get(`${this.#url}/order`, { params: { store_id: storeId, state } });
        return res.data;
    }

    // 주문 상태 수정
    async updateOrderState(orderStateData) {
        const res = await axios.patch(`${this.#url}/order/state`, orderStateData);
        return res.data;
    }

    // 메뉴 등록
    async registerMenu(menuData) {
        const res = await axios.post(`${this.#url}/menu`, menuData);
        return res.data;
    }

    // 메뉴 수정
    async updateMenu(menuData) {
        const res = await axios.put(`${this.#url}/menu`, menuData);
        return res.data;
    }

    // 메뉴 삭제
    async deleteMenu(menuId) {
        const res = await axios.delete(`${this.#url}/menu/${menuId}`);
        return res.data;
    }

    //로그인 후 가게 정보 조회 (가게 있으면 주문관리, 없으면 입점신청)
    async getMyStore() {
    const res = await axios.get(`${this.#url}/store`)
    return res.data
    }

    //매출관리
    async getSalesStats(period) {
        const res = await axios.get(`${this.#url}/sales/stats`, { params: { period } });
    return res.data;
    }

    async getSalesRanking(period) {
        const res = await axios.get(`${this.#url}/sales/ranking`, { params: { period } });
    return res.data;
    }
}

export default new OwnerService();