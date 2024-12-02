<template>
  <div class="login-container">
    <h2>Restaurant Login</h2>
    <p class="subtitle">Please sign in to manage your restaurant</p>
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="Email" prop="email">
        <el-input
          v-model="form.email"
          placeholder="Enter your email"
          type="email"
          size="large"
        >
          <template #prefix>
            <el-icon><Message /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="Password" prop="password">
        <el-input
          v-model="form.password"
          placeholder="Enter your password"
          type="password"
          size="large"
          show-password
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <div class="form-footer">
        <el-button
          type="primary"
          native-type="submit"
          size="large"
          :loading="loading"
          class="submit-btn"
        >
          Sign In
        </el-button>
      </div>
    </el-form>

    <div class="auth-links">
      <router-link to="/restaurant/register">Don't have an account? Register your restaurant</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { restaurantAuthService } from '@/services/restaurantAuth'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = ref({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    
    const response = await restaurantAuthService.login(form.value)
    console.log('Login response:', response)
    
    if (response && response.token && response.user) {
      authStore.setToken(response.token)
      authStore.setUser(response.user)
      
      ElMessage.success('Login successful')
      router.push('/restaurant-admin')
    } else {
      console.error('Invalid response structure:', response)
      throw new Error('Invalid response data')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    ElMessage.error(error.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;

  h2 {
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px;
  }

  .subtitle {
    text-align: center;
    color: #909399;
    margin-bottom: 32px;
  }
}

.form-footer {
  margin-top: 32px;
  
  .submit-btn {
    width: 100%;
    height: 48px;
    font-size: 1rem;
  }
}

.auth-links {
  margin-top: 24px;
  text-align: center;
  
  a {
    color: #409EFF;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style> 