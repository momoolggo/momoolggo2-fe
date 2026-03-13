import axios from 'axios';

class storeService{
    #url = '/store';

    async getstorelist(params) {// 가게 목록 조회
        const res = await axios.get(this.#url, {params});
        return res.data;
    }

    async getmaxpage(params) {// 가게 목록의 최대 페이지 수
        const res = await axios.get(`${this.#url}/max_page`, {params});
        return res.data;
    }

    async getStore(storeId) { // 가게 상세 정보 조회
        const res = await axios.get(`${this.#url}/${storeId}` );
        return res.data;
    }

    async getMenuList(storeId) { // 가게 메뉴 목록 조회
        const res = await axios.get(`${this.#url}/menu/${storeId}`);
        return res.data;
    }



}

export default new storeService();
