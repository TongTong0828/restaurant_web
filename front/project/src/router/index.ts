import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Dashboard from '@/views/restaurant-admin/Dashboard.vue'
import Profile from '@/views/restaurant-admin/Profile.vue'
import MenuManagement from '@/views/restaurant-admin/MenuManagement.vue'
import Orders from '@/views/restaurant-admin/Orders.vue'
import RestaurantAdminLayout from '@/layouts/RestaurantAdminLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/Home.vue')
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/About.vue')
        },
        {
          path: 'restaurants',
          name: 'restaurants',
          component: () => import('@/views/restaurants/RestaurantList.vue')
        },
        {
          path: 'restaurants/:id',
          name: 'restaurant-detail',
          component: () => import('@/views/restaurants/RestaurantDetail.vue')
        },
        {
          path: 'cart',
          name: 'cart',
          component: () => import('@/views/cart/Cart.vue')
        },
        {
          path: 'checkout',
          name: 'checkout',
          component: () => import('@/views/checkout/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'customer/profile',
          name: 'customer-profile',
          component: () => import('@/views/customer/Profile.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/views/orders/OrderList.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'orders/:id',
          name: 'order-detail',
          component: () => import('@/views/orders/OrderDetail.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/Login.vue')
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/Register.vue')
        }
      ]
    },
    {
      path: '/restaurant',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'restaurant-login',
          component: () => import('@/views/restaurant-auth/Login.vue')
        },
        {
          path: 'register',
          name: 'restaurant-register',
          component: () => import('@/views/restaurant-auth/Register.vue')
        }
      ]
    },
    {
      path: '/restaurant-admin',
      component: RestaurantAdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'restaurant-admin-dashboard',
          component: Dashboard
        },
        {
          path: 'profile',
          name: 'restaurant-admin-profile',
          component: Profile
        },
        {
          path: 'menu',
          name: 'restaurant-admin-menu',
          component: MenuManagement
        },
        {
          path: 'orders',
          name: 'restaurant-admin-orders',
          component: Orders
        }
      ]
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router 