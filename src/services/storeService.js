import axios from './httpRequester';

class storeService{
    #url = '/store'; 

    async getstorelist(params) {// 가게 목록 조회
        const res = await axios.get(this.#url, {params});
        return res.resultData;
    }

    async getmaxpage(params) {// 가게 목록의 최대 페이지 수
        const res = await axios.get(`${this.#url}/max_page`, {params});
        return res.data;
    }



}

export default new storeService();