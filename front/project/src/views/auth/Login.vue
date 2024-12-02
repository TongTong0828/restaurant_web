<template>
  <div class="login-container">
    <h2>Welcome Back</h2>
    <p class="subtitle">Please sign in to continue</p>
    
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="Email" prop="email">
        <el-input
          v-model="formData.email"
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
          v-model="formData.password"
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
      <router-link to="/auth/register">Don't have an account? Sign up</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { authService } from '@/services/auth'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const { token, user } = await authService.login(formData)
    userStore.setToken(token)
    userStore.setUser(user)
    authStore.setToken(token)
    authStore.setUser(user)
    
    const redirectPath = localStorage.getItem('redirectPath') || '/'
    localStorage.removeItem('redirectPath')
    
    if (user.role === 'restaurant') {
      router.push('/restaurant-admin')
    } else {
      router.push(redirectPath)
    }
  } catch (error: any) {
    console.error('Login failed:', error)
    ElMessage.error(error.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  h2 {
    font-size: 2rem;
    font-weight: 600;
    color: #1f1f1f;
    margin: 0 0 8px;
  }

  .subtitle {
    color: #666;
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
    color: #1890ff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style> 