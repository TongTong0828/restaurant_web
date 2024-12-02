<template>
  <div class="restaurant-list">
    <h1>All Restaurants</h1>

    <div class="filters">
      <el-input
        v-model="searchQuery"
        placeholder="Search restaurants..."
        prefix-icon="el-icon-search"
        clearable
        @input="handleSearch"
      />
      <el-select 
        v-model="selectedCategory" 
        placeholder="All Categories" 
        clearable
        @change="handleCategoryChange"
      >
        <el-option
          v-for="category in categories"
          :key="category"
          :label="category"
          :value="category"
        />
      </el-select>
      <el-select 
        v-model="sortBy" 
        placeholder="Sort by" 
        clearable
        @change="handleSortChange"
      >
        <el-option label="Rating" value="rating" />
        <el-option label="Delivery Fee" value="deliveryFee" />
        <el-option label="Minimum Order" value="minimumOrder" />
      </el-select>
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else>
      <!-- Featured Restaurants Section -->
      <div class="restaurant-section">
        <h2 class="section-title">Featured Restaurants</h2>
        <div class="restaurants">
          <restaurant-card
            v-for="restaurant in filteredMockRestaurants"
            :key="'mock-' + restaurant.id"
            :restaurant="restaurant"
            :is-mock="true"
            @click="goToRestaurant(restaurant.id)"
          />
        </div>
      </div>

      <!-- All Restaurants Section -->
      <div v-if="apiRestaurants.length > 0" class="restaurant-section">
        <h2 class="section-title">All Restaurants</h2>
        <div class="restaurants">
          <restaurant-card
            v-for="restaurant in apiRestaurants"
            :key="restaurant.id"
            :restaurant="{
              ...restaurant,
              description: restaurant.description || 'No description available',
              image: restaurant.image || defaultRestaurantImage,
              deliveryFee: restaurant.delivery_fee,
              minimumOrder: restaurant.minimum_order,
              categories: Array.isArray(restaurant.categories) 
                ? restaurant.categories 
                : (restaurant.categories ? restaurant.categories.split(',').map(c => c.trim()) : [])
            }"
            @click="goToRestaurant(restaurant.id)"
          />
        </div>
        
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 30]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <!-- No Results Message -->
      <div v-else-if="!loading && searchQuery" class="no-results">
        <el-empty description="No restaurants found" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import RestaurantCard from '@/components/RestaurantCard.vue'
import { restaurantService } from '@/services/restaurant'
import type { Restaurant } from '@/services/restaurant'
import { restaurants as mockRestaurants } from '@/mock/data'

const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const restaurants = ref<Restaurant[]>([])

// Default image for restaurants without an image
const defaultRestaurantImage = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop'

// Filter mock restaurants based on search and category
const filteredMockRestaurants = computed(() => {
  return mockRestaurants?.filter(restaurant => {
    const matchesSearch = !searchQuery.value || 
      restaurant.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (restaurant.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)
    
    const matchesCategory = !selectedCategory.value ||
      (Array.isArray(restaurant.categories) && restaurant.categories.includes(selectedCategory.value))
    
    return matchesSearch && matchesCategory
  }) ?? []
})

// Get featured restaurant IDs
const featuredRestaurantIds = computed(() => {
  const ids = new Set(mockRestaurants?.map(r => r.id.toString()) ?? [])
  console.log('Featured restaurant IDs:', [...ids])
  return ids
})

// Filter API restaurants
const apiRestaurants = computed(() => {
  console.log('Computing apiRestaurants')
  console.log('Current restaurants:', restaurants.value)

  // 确保 restaurants.value 是数组
  const currentRestaurants = Array.isArray(restaurants.value) ? restaurants.value : []
  
  const filtered = currentRestaurants.filter(restaurant => {
    // Skip if restaurant is already in featured section
    const restaurantId = restaurant.id.toString()
    if (featuredRestaurantIds.value.has(restaurantId)) {
      console.log('Skipping featured restaurant:', restaurantId)
      return false
    }

    const matchesSearch = !searchQuery.value || 
      restaurant.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (restaurant.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)
    
    let matchesCategory = !selectedCategory.value
    if (selectedCategory.value && restaurant.categories) {
      const restaurantCategories = Array.isArray(restaurant.categories) 
        ? restaurant.categories 
        : (typeof restaurant.categories === 'string' 
            ? restaurant.categories.split(',').map(c => c.trim())
            : [])
      matchesCategory = restaurantCategories.includes(selectedCategory.value)
    }

    return matchesSearch && matchesCategory
  })
  
  console.log('Filtered restaurants:', filtered)
  return filtered
})

// Get unique categories from all restaurants
const categories = computed(() => {
  const allCategories = new Set<string>()
  
  // Handle mock restaurants
  mockRestaurants?.forEach(r => {
    if (r.categories && Array.isArray(r.categories)) {
      r.categories.forEach(c => allCategories.add(c))
    }
  })
  
  // Handle API restaurants
  if (Array.isArray(restaurants.value)) {
    restaurants.value.forEach(r => {
      if (r.categories) {
        if (typeof r.categories === 'string') {
          r.categories.split(',').forEach(c => allCategories.add(c.trim()))
        } else if (Array.isArray(r.categories)) {
          r.categories.forEach(c => allCategories.add(c))
        }
      }
    })
  }
  
  return [...allCategories].sort()
})

const fetchRestaurants = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      category: selectedCategory.value || undefined,
      sort: sortBy.value || undefined
    }
    
    console.log('Fetching restaurants with params:', params)
    const response = await restaurantService.getRestaurants(params)
    
    console.log('API Response:', response)
    if (response?.data) {
      const { restaurants: fetchedRestaurants, total: totalCount, page, limit } = response.data
      
      console.log('Setting restaurants:', fetchedRestaurants)
      restaurants.value = fetchedRestaurants
      total.value = totalCount
      currentPage.value = page
      pageSize.value = limit
      
      console.log('Updated restaurants:', restaurants.value)
      console.log('Total restaurants:', total.value)
      console.log('Current page:', currentPage.value)
      console.log('Page size:', pageSize.value)
    } else {
      console.warn('Invalid response format')
      restaurants.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('Failed to fetch restaurants:', error)
    restaurants.value = []
    total.value = 0
    ElMessage.error('Failed to load restaurants')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchRestaurants()
}

const handleCategoryChange = () => {
  currentPage.value = 1
  fetchRestaurants()
}

const handleSortChange = () => {
  currentPage.value = 1
  fetchRestaurants()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchRestaurants()
}

const handlePageChange = (val: number) => {
  currentPage.value = val
  fetchRestaurants()
}

const goToRestaurant = (id: string | number) => {
  router.push(`/restaurants/${id}`)
}

onMounted(() => {
  fetchRestaurants()
})
</script>

<style scoped lang="scss">
.restaurant-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .filters {
    display: flex;
    gap: 20px;
    margin-bottom: 2rem;

    .el-input {
      max-width: 300px;
    }

    .el-select {
      min-width: 200px;
    }
  }

  .loading {
    padding: 20px;
  }

  .restaurant-section {
    margin-bottom: 3rem;

    .section-title {
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      color: #409EFF;
      border-bottom: 2px solid #409EFF;
      padding-bottom: 0.5rem;
    }
  }

  .restaurants {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
    margin-bottom: 2rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  .no-results {
    text-align: center;
    padding: 2rem;
  }
}
</style> 