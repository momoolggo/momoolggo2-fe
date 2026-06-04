import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import notificationService from '@/services/notificationService'

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref([])
    const isLoading = ref(false)
    const eventSource = ref(null)

    const unreadCount = computed(() =>
        notifications.value.filter(item => !item.read).length
    )

    const normalizeNotification = notification => ({
        ...notification,
        read: notification.read ?? false,
    })

    const fetchNotifications = async () => {
        if (isLoading.value) return  // 중복 요청 방지
        isLoading.value = true

        try {
            const res = await notificationService.getNotifications()
            notifications.value = (res.resultData || []).map(normalizeNotification)
        } finally {
            isLoading.value = false
        }
    }

    const addNotification = notification => {
        const next = normalizeNotification(notification)
        const exists = notifications.value.some(
            item => item.notificationId === next.notificationId
        )

        if (!exists) {
            notifications.value.unshift(next)
        }
    }

    const readNotification = async notificationId => {
        await notificationService.readNotification(notificationId)

        const target = notifications.value.find(
            item => item.notificationId === notificationId
        )

        if (target) {
            target.read = true
            target.readAt = target.readAt || new Date().toISOString()
        }
    }

    const readAllNotifications = async () => {
        await notificationService.readAllNotifications()

        notifications.value = notifications.value.map(item => ({
            ...item,
            read: true,
            readAt: item.readAt || new Date().toISOString(),
        }))
    }

    const connectSse = () => {
        if (eventSource.value) return

        eventSource.value = new EventSource('/api/notification/subscribe', {
            withCredentials: true,
        })

        eventSource.value.addEventListener('connect', event => {
            console.log('notification sse connected:', event.data)
        })

        eventSource.value.addEventListener('notification', async event => {
            console.log('notification sse received:', event.data)
        
            try {
                const notification = JSON.parse(event.data)
        
                if (notification.notificationId) {
                    addNotification(notification)
                    return
                }
        
                await fetchNotifications()
            } catch (e) {
                console.error('notification sse parse error:', e)
                await fetchNotifications()
            }
        })

        eventSource.value.onerror = error => {
            console.error('notification sse error:', error)
        }
    }

    const disconnectSse = () => {
        if (!eventSource.value) return

        eventSource.value.close()
        eventSource.value = null
    }

    const resetNotifications = () => {
        notifications.value = []
        disconnectSse()
    }

    return {
        notifications,
        isLoading,
        unreadCount,
        fetchNotifications,
        readNotification,
        readAllNotifications,
        connectSse,
        disconnectSse,
        resetNotifications,
    }
})