<template>
  <div class="home">
    <div class="hero">
      <h1>Welcome to Food Delivery</h1>
      <p>Order your favorite food from the best restaurants</p>
      <router-link to="/restaurants">
        <el-button type="primary" size="large">Browse Restaurants</el-button>
      </router-link>
    </div>
    
    <div class="features">
      <div class="feature">
        <el-icon size="32"><Van /></el-icon>
        <h3>Fast Delivery</h3>
        <p>Get your food delivered within 30 minutes</p>
      </div>
      <div class="feature">
        <el-icon size="32"><Food /></el-icon>
        <h3>Quality Food</h3>
        <p>Choose from a wide variety of restaurants</p>
      </div>
      <div class="feature">
        <el-icon size="32"><Service /></el-icon>
        <h3>Great Service</h3>
        <p>24/7 customer support</p>
      </div>
    </div>

    <div class="popular-restaurants">
      <div class="section-header">
        <h2>Popular Restaurants</h2>
        <router-link to="/restaurants" class="view-all">
          View All
        </router-link>
      </div>
      <div class="restaurant-grid">
        <div v-for="restaurant in mockRestaurants" :key="restaurant.id" class="restaurant-card">
          <router-link :to="'/restaurants/' + restaurant.id">
            <div class="restaurant-image">
              <img :src="restaurant.image" :alt="restaurant.name">
            </div>
            <div class="restaurant-info">
              <h3>{{ restaurant.name }}</h3>
              <div class="rating">
                <el-rate
                  v-model="restaurant.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
              </div>
              <div class="categories">
                {{ restaurant.categories.join(' | ') }}
              </div>
              <div class="delivery">
                <span class="delivery-fee">Delivery Fee: ${{ restaurant.deliveryFee }}</span>
                <span class="minimum-order">Min. Order: ${{ restaurant.minimumOrder }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Van, Food, Service } from '@element-plus/icons-vue'
import { restaurants as mockRestaurants } from '@/mock/data'
</script>

<style scoped lang="scss">
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #409EFF 0%, #36cfc9 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 60px;
  
  h1 {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 20px;
    margin-bottom: 30px;
    opacity: 0.9;
  }
  
  .el-button {
    padding: 12px 30px;
    font-size: 18px;
  }
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  padding: 20px;
  margin-bottom: 60px;
}

.feature {
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .el-icon {
    color: #409EFF;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 20px;
    margin-bottom: 15px;
    color: #303133;
  }
  
  p {
    color: #606266;
    line-height: 1.6;
  }
}

.popular-restaurants {
  padding: 20px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    
    h2 {
      font-size: 28px;
      color: #303133;
      margin: 0;
    }
    
    .view-all {
      color: #409EFF;
      font-size: 16px;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .restaurant-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }
  
  .restaurant-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    a {
      text-decoration: none;
      color: inherit;
    }
    
    .restaurant-image {
      height: 200px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .restaurant-info {
      padding: 20px;
      
      h3 {
        font-size: 18px;
        color: #303133;
        margin: 0 0 10px 0;
      }
      
      .rating {
        margin-bottom: 10px;
      }
      
      .categories {
        color: #666;
        font-size: 14px;
        margin: 8px 0;
        
        span.separator {
          color: #999;
          margin: 0 4px;
        }
      }
      
      .delivery {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #909399;
        
        .delivery-fee, .minimum-order {
          background: #f5f7fa;
          padding: 4px 8px;
          border-radius: 4px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 40px 20px;
    
    h1 {
      font-size: 36px;
    }
    
    p {
      font-size: 18px;
    }
  }
  
  .popular-restaurants {
    .section-header {
      h2 {
        font-size: 24px;
      }
    }
    
    .restaurant-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style> 