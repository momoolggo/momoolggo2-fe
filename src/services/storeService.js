import axios from 'axios';

class StoreService {
    #url = '/store';

    // 가게 목록 조회
    async getStoreList(params) {
        const res = await axios.get(this.#url, { params });
        return res.data;
    }

    // 가게 목록 최대 페이지 수
    async getMaxStore(params) {
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

     // 메뉴, 가게 검색
    async getSearchStore(params) {
        const res = await axios.get(`${this.#url}/searchstore`, { params });
        return res.data;
    }

     // 가게 내 메뉴 검색
    async menuSearchInStore(storeId, searchText) {
        const res = await axios.get(`${this.#url}/${storeId}/menu/search`, { params:  { search_text: searchText }  });
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

    async getNearbyStores(lat, lng) {
    const res = await axios.get(`${this.#url}/nearby`, { params: { lat, lng } });
    return res.data;
    }

    async getStoreReviews(storeId) {
    const res = await axios.get(`${this.#url}/${storeId}/review`)
    return res.data
}
}

export default new StoreService();
