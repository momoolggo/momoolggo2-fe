import { defineStore } from 'pinia'
import { ref } from 'vue'
import cartService from '@/services/cartService'

export const useCartStore = defineStore('cart', () => {
    const cartCount = ref(0)

    const refreshCartCount = async (userNo) => {
        if(!userNo) {
            cartCount.value = 0
            return
        }
        try {
            const res = await cartService.getCartList(userNo)
            const cart = res.resultData
            cartCount.value = cart?.cartCount || 0
        } catch (e) {
            cartCount.value = 0
        }
    }

    const resetCount = () => {
        cartCount.value = 0
    }

    return {
        cartCount,
        refreshCartCount,
        resetCount,
    }
})