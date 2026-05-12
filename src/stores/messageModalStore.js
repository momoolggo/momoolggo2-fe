import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useMessageModalStore = defineStore('messageModal', () => {
  const state = reactive({
    message: '',
    isOpen: false,
  })

  const setMessage = (message) => {
    state.message = message ?? ''
    state.isOpen = true
  }

  const close = () => {
    state.message = ''
    state.isOpen = false
  }

  return { state, setMessage, close }
})
