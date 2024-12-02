<template>
  <router-link
    :to="`/restaurants/${restaurant.id}`"
    class="restaurant-card"
  >
    <div class="restaurant-image">
      <img :src="restaurant.image" :alt="restaurant.name">
      <div class="delivery-info">
        <span class="delivery-fee">
          Delivery: {{ displayDeliveryFee }}$
        </span>
        <span class="delivery-time">
          30-45 min
        </span>
      </div>
    </div>

    <div class="restaurant-info">
      <div class="header">
        <h3>{{ restaurant.name }}</h3>
        <div class="rating">
          <el-rate
            :model-value="Number(restaurant.rating)"
            disabled
            text-color="#ff9900"
          />
          <span>{{ restaurant.rating }}</span>
        </div>
      </div>

      <div class="categories">
        {{ restaurant.categories.join(' | ') }}
      </div>

      <div class="footer">
        <span class="min-order">
          Min. order: {{ displayMinimumOrder }} $
        </span>
        <span class="status" :class="{ open: isOpen }">
          {{ isOpen ? 'Open' : 'Closed' }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Restaurant } from '@/services/restaurant'

const props = defineProps<{
  restaurant: Restaurant
}>()

const mockPrices = {
  2: { delivery_fee: '5.00', minimum_order: '20.00' },
  3: { delivery_fee: '6.00', minimum_order: '30.00' },
  5: { delivery_fee: '8.00', minimum_order: '40.00' }
}

const displayDeliveryFee = computed(() => {
  const mockPrice = mockPrices[props.restaurant.id as keyof typeof mockPrices]
  return mockPrice ? mockPrice.delivery_fee : (props.restaurant.delivery_fee || '0.00')
})

const displayMinimumOrder = computed(() => {
  const mockPrice = mockPrices[props.restaurant.id as keyof typeof mockPrices]
  return mockPrice ? mockPrice.minimum_order : (props.restaurant.minimum_order || '0.00')
})

const isOpen = computed(() => {
  if (!props.restaurant.opening_hours) return false
  
  const now = new Date()
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayOfWeek = days[now.getDay()]
  const todayHours = props.restaurant.opening_hours[dayOfWeek]
  
  if (!todayHours || typeof todayHours !== 'string') return false
  
  const hoursParts = todayHours.split('-')
  if (hoursParts.length !== 2) return false

  try {
    const currentTime = now.getHours() * 100 + now.getMinutes()
    const [openHour, openMinute] = hoursParts[0].trim().split(':').map(Number)
    const [closeHour, closeMinute] = hoursParts[1].trim().split(':').map(Number)
    
    if (isNaN(openHour) || isNaN(openMinute) || isNaN(closeHour) || isNaN(closeMinute)) {
      return false
    }
    
    const openTime = openHour * 100 + openMinute
    const closeTime = closeHour * 100 + closeMinute

    return currentTime >= openTime && currentTime <= closeTime
  } catch (error) {
    console.error('Error parsing restaurant hours:', error)
    return false
  }
})
</script>

<style scoped lang="scss">
.restaurant-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
}

.restaurant-image {
  position: relative;
  padding-top: 56.25%; // 16:9 aspect ratio

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .delivery-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 16px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    color: white;
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
  }
}

.restaurant-info {
  padding: 16px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;

    h3 {
      font-size: 1.25rem;
      margin: 0;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;

      span {
        color: #ff9900;
        font-weight: 500;
      }
    }
  }

  .categories {
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 12px;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;

    .min-order {
      color: #666;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
      
      &.open {
        background: #f6ffed;
        color: #52c41a;
      }
      
      &:not(.open) {
        background: #fff1f0;
        color: #f5222d;
      }
    }
  }
}
</style> 