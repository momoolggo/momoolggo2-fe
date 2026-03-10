<script setup>
defineProps({
store: {
    type: Object,
    required: true
}
});

defineEmits(['click']);
</script>


<template>
<div class="store-card" @click="$emit('click', store.id)">
    <img 
    :src="store.thumbnail || '/images/default-store.png'" 
    class="store-thumbnail" 
    alt="가게 이미지" 
    />
    
    <div class="store-details">
    <h3 class="store-name">{{ store.name }}</h3>
    
    <div class="store-meta">
        <span class="rating">⭐ {{ store.rating }}</span>
        <span class="distance">{{ store.distance }}km</span>
    </div>
    
    <div class="delivery-stats">
        <span>최소주문 {{ store.minOrderPrice.toLocaleString() }}원</span>
        <span class="divider">|</span>
        <span>배달팁 {{ store.deliveryTip.toLocaleString() }}원</span>
    </div>
    </div>
</div>
</template>



<style scoped>
.store-card {
display: flex;
padding: 16px;
gap: 16px;
border-bottom: 1px solid #f0f0f0;
cursor: pointer;
}

.store-thumbnail {
width: 88px;
height: 88px;
border-radius: 8px;
object-fit: cover;
background-color: #f8f8f8;
}

.store-details {
display: flex;
flex-direction: column;
justify-content: center;
}

.store-name {
margin: 0 0 4px 0;
font-size: 1.1rem;
font-weight: 600;
color: #333;
}

.store-meta {
font-size: 0.9rem;
margin-bottom: 6px;
}

.rating {
font-weight: bold;
margin-right: 8px;
}

.distance {
color: #888;
}

.delivery-stats {
font-size: 0.85rem;
color: #666;
}

.divider {
margin: 0 6px;
color: #eee;
}
</style>