import axios from 'axios';

class StoreService {
    #url = '/store';

    // 가게 목록 조회
    async getStoreList(params) {
        const res = await axios.get(this.#url, { params });
        return res.data;
    }

    // 가게 목록 최대 페이지 수
    async getMaxPage(params) {
        const res = await axios.get(`${this.#url}/max_page`, { params });
        return res.data;
    }

    // 가게 상세 정보 조회
    async getStore(storeId) {
        const res = await axios.get(`${this.#url}/${storeId}`);
        return res.data;
    }

    // 가게 메뉴 목록 조회
    async getMenuList(storeId) {
        const res = await axios.get(`${this.#url}/menu/${storeId}`);
        return res.data;
    }

    // 가게 찜 조회
    async getFavorite(params) {
        const res = await axios.get(`${this.#url}/favorite`, { params });
        return res.data;
    }
    // 가게 찜 여부 체크
    async checkFavorite(params) {
        const res = await axios.get(`${this.#url}/favorite/check`,  {params} );
        return res.data;
    }

    // 가게 찜 토글
    async toggleFavorite(params) {
        const res = await axios.post(`${this.#url}/favorite`,  params );
        return res.data;
    }
}

export default new StoreService();
