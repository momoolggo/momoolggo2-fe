import axios from '@/services/httpRequester'

class NotificationService {
    #url = '/notification';

    async getNotifications() {
        const res = await axios.get(this.#url);
        return res.data;
    }

    async readNotification(notificationId) {
        const res = await axios.put(`${this.#url}/${notificationId}/read`);
        return res.data;
    }

    async readAllNotifications() {
        const res = await axios.put(`${this.#url}/read-all`);
        return res.data;
    }
}

export default new NotificationService();