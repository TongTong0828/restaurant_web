<template>
  <div class="register-container">
    <h2>Restaurant Registration</h2>
    <p class="subtitle">Register your restaurant to start serving customers</p>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent="submitForm"
    >
      <!-- Basic Information -->
      <h3 class="section-title">Basic Information</h3>
      <el-form-item label="Email" prop="email">
        <el-input
          v-model="form.email"
          placeholder="Enter business email"
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
          placeholder="Create password"
          type="password"
          size="large"
          show-password
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Name" prop="name">
        <el-input
          v-model="form.name"
          placeholder="Owner's name"
          size="large"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Phone" prop="phone">
        <el-input
          v-model="form.phone"
          placeholder="Owner's phone"
          size="large"
        >
          <template #prefix>
            <el-icon><Phone /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- Restaurant Information -->
      <h3 class="section-title">Restaurant Information</h3>
      <el-form-item label="Restaurant Name" prop="restaurantName">
        <el-input
          v-model="form.restaurantName"
          placeholder="Enter restaurant name"
          size="large"
        >
          <template #prefix>
            <el-icon><Shop /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Description" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="Describe your restaurant"
          :rows="3"
        />
      </el-form-item>

      <el-form-item label="Restaurant Phone" prop="restaurantPhone">
        <el-input
          v-model="form.restaurantPhone"
          placeholder="Restaurant phone (optional)"
          size="large"
        >
          <template #prefix>
            <el-icon><Phone /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Address" prop="address">
        <el-input
          v-model="form.address"
          placeholder="Enter restaurant address"
          size="large"
        >
          <template #prefix>
            <el-icon><Location /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Restaurant Image" prop="restaurantImage">
        <el-upload
          class="upload-component"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleRestaurantImageChange"
          accept="image/*"
        >
          <img v-if="restaurantImageUrl" :src="restaurantImageUrl" class="preview-image">
          <div v-else class="upload-placeholder">
            <el-icon><Plus /></el-icon>
            <span>Click to upload restaurant image</span>
            <div class="upload-tip">JPG/PNG files less than 5MB</div>
          </div>
        </el-upload>
      </el-form-item>

      <el-form-item label="Categories" prop="categories">
        <el-select
          v-model="form.categories"
          multiple
          placeholder="Select restaurant categories"
          size="large"
          style="width: 100%"
        >
          <el-option
            v-for="category in availableCategories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Delivery Fee ($)" prop="delivery_fee">
        <el-input-number
          v-model="form.delivery_fee"
          :precision="2"
          :step="0.5"
          :min="0"
          size="large"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Minimum Order ($)" prop="minimum_order">
        <el-input-number
          v-model="form.minimum_order"
          :precision="2"
          :step="1"
          :min="0"
          size="large"
          style="width: 100%"
        />
      </el-form-item>

      <!-- Business Hours -->
      <h3 class="section-title">Business Hours</h3>
      <div class="business-hours">
        <div v-for="day in days" :key="day.value" class="time-row">
          <span class="day-label">{{ day.label }}</span>
          <el-time-select
            v-model="form.opening_hours[day.value].open"
            class="time-select"
            placeholder="Opening time"
            start="06:00"
            step="00:30"
            end="24:00"
          />
          <span class="time-separator">to</span>
          <el-time-select
            v-model="form.opening_hours[day.value].close"
            class="time-select"
            placeholder="Closing time"
            start="06:00"
            step="00:30"
            end="24:00"
            :min-time="form.opening_hours[day.value].open"
          />
        </div>
      </div>

      <!-- Menu Items -->
      <h3 class="section-title">Menu Items</h3>
      <div v-for="(item, index) in form.menu_items" :key="index" class="menu-item">
        <div class="menu-item-header">
          <h4>Menu Item {{ index + 1 }}</h4>
          <el-button link type="danger" @click="removeMenuItem(index)">
            <el-icon><Delete /></el-icon>
            Remove
          </el-button>
        </div>

        <el-form-item :label="'Name'" :prop="'menu_items.' + index + '.name'">
          <el-input
            v-model="item.name"
            placeholder="Item name"
            size="large"
          />
        </el-form-item>

        <el-form-item :label="'Description'" :prop="'menu_items.' + index + '.description'">
          <el-input
            v-model="item.description"
            type="textarea"
            placeholder="Item description"
            :rows="2"
          />
        </el-form-item>

        <el-form-item :label="'Price ($)'" :prop="'menu_items.' + index + '.price'">
          <el-input-number
            v-model="item.price"
            :precision="2"
            :step="0.5"
            :min="0"
            size="large"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="'Category'" :prop="'menu_items.' + index + '.category'">
          <el-select
            v-model="item.category"
            placeholder="Select category"
            size="large"
            style="width: 100%"
          >
            <el-option
              v-for="category in menuCategories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="'Image'" :prop="'menu_items.' + index + '.image'">
          <el-upload
            class="upload-component"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="(file) => handleMenuImageChange(file, index)"
            accept="image/*"
          >
            <img v-if="item.imageUrl" :src="item.imageUrl" class="preview-image">
            <div v-else class="upload-placeholder">
              <el-icon><Plus /></el-icon>
              <span>Click to upload item image</span>
              <div class="upload-tip">JPG/PNG files less than 5MB</div>
            </div>
          </el-upload>
        </el-form-item>
      </div>

      <el-button type="primary" plain @click="addMenuItem" class="add-item-btn">
        <el-icon><Plus /></el-icon>
        Add Menu Item
      </el-button>

      <div class="form-footer">
        <el-button
          type="primary"
          native-type="submit"
          size="large"
          :loading="loading"
          class="submit-btn"
        >
          Register Restaurant
        </el-button>
      </div>
    </el-form>

    <div class="auth-links">
      <router-link to="/restaurant/login">Already have an account? Sign in</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Message, Lock, User, Shop, Phone, Location, Plus, Delete } from '@element-plus/icons-vue'
import { restaurantAuthService } from '@/services/restaurantAuth'

const router = useRouter()
const loading = ref(false)
const formRef = ref<FormInstance>()
const restaurantImageUrl = ref('')
const restaurantImageFile = ref<File | null>(null)

const days = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' }
]

// 分类ID映射
const categoryIds = {
  Japanese: 1,
  Sushi: 2,
  Seafood: 3,
  Italian: 4,
  Pizza: 5,
  Pasta: 6,
  Chinese: 7,
  Asian: 8,
  'Fine Dining': 9,
  Western: 10,
  'Main Dishes': 11,
  Appetizers: 12,
  Rolls: 13,
  Nigiri: 14,
  'Hot Dishes': 15,
  Pizzas: 16,
  Sides: 17
}

const availableCategories = Object.entries(categoryIds).map(([name, id]) => ({
  label: name,
  value: id
}))

const menuCategories = [
  'Appetizers',
  'Main Dishes',
  'Sides',
  'Desserts',
  'Beverages',
  'Pizza',
  'Pasta',
  'Sushi',
  'Rolls',
  'Hot Dishes'
]

const form = ref({
  email: '',
  password: '',
  name: '',
  phone: '',
  restaurantName: '',
  description: '',
  address: '',
  restaurantPhone: '',
  delivery_fee: 0,
  minimum_order: 0,
  categories: [] as number[],
  opening_hours: {
    monday: { open: '', close: '' },
    tuesday: { open: '', close: '' },
    wednesday: { open: '', close: '' },
    thursday: { open: '', close: '' },
    friday: { open: '', close: '' },
    saturday: { open: '', close: '' },
    sunday: { open: '', close: '' }
  },
  menu_items: [{
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    imageFile: null as File | null
  }]
})

const rules = {
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  name: [
    { required: true, message: 'Please enter your name', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Please enter phone number', trigger: 'blur' }
  ],
  restaurantName: [
    { required: true, message: 'Please enter restaurant name', trigger: 'blur' }
  ],
  address: [
    { required: true, message: 'Please enter restaurant address', trigger: 'blur' }
  ],
  categories: [
    { required: true, message: 'Please select at least one category', trigger: 'change' }
  ],
  delivery_fee: [
    { required: true, message: 'Please enter delivery fee', trigger: 'blur' },
    { type: 'number', message: 'Delivery fee must be a number', trigger: 'blur' }
  ],
  minimum_order: [
    { required: true, message: 'Please enter minimum order amount', trigger: 'blur' },
    { type: 'number', message: 'Minimum order must be a number', trigger: 'blur' }
  ]
}

const addMenuItem = () => {
  form.value.menu_items.push({
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    imageFile: null
  })
}

const removeMenuItem = (index: number) => {
  form.value.menu_items.splice(index, 1)
}

const handleRestaurantImageChange = (file: File) => {
  if (!file) return
  
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('You can only upload image files!')
    return
  }
  if (!isLt5M) {
    ElMessage.error('Image size can not exceed 5MB!')
    return
  }

  restaurantImageFile.value = file
  restaurantImageUrl.value = URL.createObjectURL(file)
}

const handleMenuImageChange = (file: File, index: number) => {
  if (!file) return
  
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('You can only upload image files!')
    return
  }
  if (!isLt5M) {
    ElMessage.error('Image size can not exceed 5MB!')
    return
  }

  form.value.menu_items[index].imageFile = file
  form.value.menu_items[index].imageUrl = URL.createObjectURL(file)
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true

    const formData = new FormData()
    
    // 必填字段
    formData.append('email', form.value.email)
    formData.append('password', form.value.password)
    formData.append('name', form.value.name)
    formData.append('phone', form.value.phone)
    formData.append('restaurantName', form.value.restaurantName)
    formData.append('address', form.value.address)
    
    // 选填字段
    if (form.value.description) {
      formData.append('description', form.value.description)
    }
    
    if (form.value.restaurantPhone) {
      formData.append('restaurantPhone', form.value.restaurantPhone)
    }
    
    // 处理分类 - 发送分类ID数组
    if (form.value.categories && form.value.categories.length > 0) {
      // categories已经是ID数组，因为我们在select中使用的是ID作为value
      formData.append('categories', JSON.stringify(form.value.categories))
    } else {
      formData.append('categories', JSON.stringify([]))
    }
    
    if (form.value.delivery_fee !== undefined) {
      formData.append('delivery_fee', form.value.delivery_fee.toString())
    }
    
    if (form.value.minimum_order !== undefined) {
      formData.append('minimum_order', form.value.minimum_order.toString())
    }
    
    // 处理营业时间 - 只发送有效的时间段
    const openingHours: Record<string, { open: string; close: string }> = {}
    Object.entries(form.value.opening_hours).forEach(([day, time]) => {
      if (time.open && time.close) {
        openingHours[day] = time
      }
    })
    if (Object.keys(openingHours).length > 0) {
      formData.append('opening_hours', JSON.stringify(openingHours))
    }

    // 餐厅图片
    if (restaurantImageFile.value) {
      formData.append('restaurantImage', restaurantImageFile.value)
    }

    // 打印表单数据
    console.log('Form Data Contents:')
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1])
    }

    const response = await restaurantAuthService.register(formData)
    console.log('Registration Response:', response)
    
    // 注册成功，保存token和用户信息，然后跳转
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
    ElMessage.success('Registration successful')
    
    // 直接跳转到餐厅管理页面
    window.location.href = '/restaurant-admin'
  } catch (error: any) {
    console.error('Registration Error Details:', {
      error,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    })
    
    let errorMessage = 'Registration failed'
    if (error.response) {
      switch (error.response.data.message) {
        case 'Email already exists':
          errorMessage = 'This email is already registered'
          break
        case 'Only image files are allowed!':
          errorMessage = 'Please upload a valid image file'
          break
        case 'File too large':
          errorMessage = 'Image file must be less than 5MB'
          break
        case 'Missing required fields':
          errorMessage = 'Please fill in all required fields'
          break
        default:
          errorMessage = error.response.data.message || 'Registration failed'
      }
    }
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.register-container {
  max-width: 600px;
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

  .section-title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin: 24px 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #EBEEF5;
  }
}

.business-hours {
  .time-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 12px;

    .day-label {
      width: 100px;
      color: #606266;
    }

    .time-select {
      flex: 1;
    }

    .time-separator {
      color: #909399;
      margin: 0 8px;
    }
  }
}

.menu-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;

  .menu-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 16px;
      color: #303133;
    }
  }
}

.upload-component {
  .preview-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
  }

  .upload-placeholder {
    width: 100%;
    height: 200px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    cursor: pointer;
    transition: border-color 0.3s;

    &:hover {
      border-color: #409EFF;
      color: #409EFF;
    }

    .el-icon {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .upload-tip {
      font-size: 12px;
      margin-top: 8px;
    }
  }
}

.add-item-btn {
  width: 100%;
  margin-bottom: 24px;
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