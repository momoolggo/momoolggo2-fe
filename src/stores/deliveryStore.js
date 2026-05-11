import { defineStore } from 'pinia'
import { reactive } from 'vue'
import deliveryService from '@/services/deliveryService'

/**
 * 라이더 배달 store — R1-FE riderStore 패턴 일관.
 * 대기/진행 목록 + 현재 활성 배달 + 마지막 동기화 시각.
 */
export const useDeliveryStore = defineStore('delivery', () => {

    const state = reactive({
        waiting: [],          // WAITING_ASSIGN 목록 (가용 라이더 모두 대상)
        inProgress: [],       // 본인 진행 중 5 status
        currentTab: 'waiting',// 'waiting' | 'inprogress' | 'completed'
        loadingWaiting: false,
        loadingInProgress: false,
        lastSyncedAt: null,
    })

    const loadWaiting = async () => {
        state.loadingWaiting = true
        try {
            state.waiting = await deliveryService.getWaiting()
            state.lastSyncedAt = new Date()
        } catch {
            state.waiting = []
        } finally {
            state.loadingWaiting = false
        }
    }

    const loadInProgress = async () => {
        state.loadingInProgress = true
        try {
            state.inProgress = await deliveryService.getInProgress()
            state.lastSyncedAt = new Date()
        } catch {
            state.inProgress = []
        } finally {
            state.loadingInProgress = false
        }
    }

    /** 본인 진행 중 배달 1건 조회 — 진행 탭 단일 배달 카드용. */
    const currentDelivery = () => {
        return state.inProgress.length > 0 ? state.inProgress[0] : null
    }

    const setTab = (tab) => {
        state.currentTab = tab
    }

    const reset = () => {
        state.waiting = []
        state.inProgress = []
        state.currentTab = 'waiting'
        state.lastSyncedAt = null
    }

    return { state, loadWaiting, loadInProgress, currentDelivery, setTab, reset }
})
