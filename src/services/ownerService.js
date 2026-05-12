import axios from '@/services/httpRequester'

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
        const res = await axios.put(`${this.#url}/store/status`, statusData);
        return res.data;
    }

    // 가게 삭제
    async deleteStore(storeId) {
        const res = await axios.delete(`${this.#url}/store/${storeId}`);
        return res.data;
    }

    // 가게 주문 조회 (날짜 필터 추가)
    async getOrders(storeId, state, date) {
        const params = { store_id: storeId };
        if (state != null) params.state = state;
        if (date) params.date = date;
        const res = await axios.get(`${this.#url}/order`, { params });
        return res.data;
    }

    // 주문 상태 수정 (PUT으로 변경)
    async updateOrderState(orderId, orderState) {
        const res = await axios.put(`${this.#url}/order/${orderId}`, { orderState });
        return res.data;
    }

    // 주문 삭제 (추가)
    async deleteOrder(orderId) {
        const res = await axios.delete(`${this.#url}/order/${orderId}`);
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

    // 로그인 후 가게 정보 조회
    async getMyStores() {
        const res = await axios.get(`${this.#url}/store`);
        return res.data;
    }

    // 매출관리
    async getSalesStats(storeId, period) {
        const res = await axios.get(`${this.#url}/sales/stats`, { params: { storeId, period } });
        return res.data;
    }

    async getSalesRanking(storeId, period) {
        const res = await axios.get(`${this.#url}/sales/ranking`, { params: { storeId, period } });
        return res.data;
    }

    // 메뉴 목록 조회
    async getMenus(storeId) {
        const res = await axios.get(`${this.#url}/menu`, { params: { storeId } });
        return res.data;
    }

    // 카테고리 목록 조회
    async getCategories(storeId) {
        const res = await axios.get(`${this.#url}/category`, { params: { storeId } });
        return res.data;
    }

    // 카테고리 추가
    async addCategory(storeId, category) {
        const res = await axios.post(`${this.#url}/category`, { storeId, category });
        return res.data;
    }

    // 카테고리 수정
    async updateCategory(categoryId, category) {
        const res = await axios.put(`${this.#url}/category`, { categoryId, category });
        return res.data;
    }

    // 카테고리 삭제
    async deleteCategory(categoryId) {
        const res = await axios.delete(`${this.#url}/category/${categoryId}`);
        return res.data;
    }

    // 메뉴 이미지 업로드
    async uploadMenuImage(formData) {
        const res = await axios.post(`${this.#url}/menu/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }

    // 가게 이미지 업로드
    async uploadStoreImage(formData) {
        const res = await axios.post(`${this.#url}/store/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }
}

export default new OwnerService();