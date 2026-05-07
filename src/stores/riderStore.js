import { defineStore } from 'pinia'
import { reactive } from 'vue'
import riderService from '@/services/riderService'

export const useRiderStore = defineStore('rider', () => {

    const state = reactive({
        profile: null,        // RiderProfileRes — riderNo/status/license/vehicle/account 등
        isLoaded: false,
    })

    const loadProfile = async () => {
        try {
            const data = await riderService.getMe()
            state.profile = data
            state.isLoaded = true
        } catch {
            reset()
        }
    }

    const setProfile = (data) => {
        state.profile = data
        state.isLoaded = true
    }

    const reset = () => {
        state.profile = null
        state.isLoaded = false
    }

    return { state, loadProfile, setProfile, reset }
})
