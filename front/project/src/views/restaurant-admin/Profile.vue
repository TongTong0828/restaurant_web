<template>
  <div class="restaurant-profile">
    <div class="page-header">
      <h2>Restaurant Profile</h2>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      v-loading="loading"
    >
      <!-- 基本信息 -->
      <div class="section">
        <h3>Basic Information</h3>
        <el-form-item label="Restaurant Name" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>

        <el-form-item label="Address" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>

        <el-form-item label="Phone" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>

        <el-form-item label="Categories" prop="categories">
          <el-select
            v-model="form.categories"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="Select or create categories"
          >
            <el-option
              v-for="item in availableCategories"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 配送信息 -->
      <div class="section">
        <h3>Delivery Settings</h3>
        <el-form-item label="Delivery Fee" prop="delivery_fee">
          <el-input-number
            v-model="form.delivery_fee"
            :precision="2"
            :step="0.5"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="Minimum Order" prop="minimum_order">
          <el-input-number
            v-model="form.minimum_order"
            :precision="2"
            :step="5"
            :min="0"
          />
        </el-form-item>
      </div>

      <!-- 营业时间 -->
      <div class="section">
        <h3>Opening Hours</h3>
        <div v-for="day in days" :key="day.value" class="time-row">
          <el-form-item :label="day.label">
            <div class="time-inputs">
              <el-time-select
                v-model="form.opening_hours[day.value].open"
                start="00:00"
                step="00:30"
                end="23:30"
                placeholder="Open"
              />
              <span class="time-separator">to</span>
              <el-time-select
                v-model="form.opening_hours[day.value].close"
                start="00:00"
                step="00:30"
                end="23:30"
                placeholder="Close"
              />
            </div>
          </el-form-item>
        </div>
      </div>

      <!-- 餐厅图片 -->
      <div class="section">
        <h3>Restaurant Image</h3>
        <el-form-item label="Image">
          <div class="image-upload">
            <el-upload
              class="upload-component"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleImageChange"
              accept="image/*"
            >
              <img v-if="form.image" :src="form.image" class="preview-image">
              <div v-else class="upload-placeholder">
                <el-icon><Plus /></el-icon>
                <span>Click to upload</span>
                <div class="upload-tip">JPG/PNG files less than 5MB</div>
              </div>
            </el-upload>
          </div>
        </el-form-item>
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="saveProfile" :loading="saving">
          Save Changes
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { restaurantManagementService } from '@/services/restaurantManagement'
import type { RestaurantProfile } from '@/services/restaurantManagement'
import { useAuthStore } from '@/stores/auth'
import { restaurantAuthService } from '@/services/restaurantAuth'

const loading = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const imageFile = ref<File | null>(null)

const authStore = useAuthStore()
const restaurantId = computed(() => {
  const user = authStore.user
  if (!user?.restaurant_id) {
    console.log('Current user data:', user)
    return null
  }
  return user.restaurant_id
})

const form = ref<RestaurantProfile>({
  id: 0,
  name: '',
  description: '',
  address: '',
  phone: '',
  image: '',
  delivery_fee: 0,
  minimum_order: 0,
  categories: [],
  opening_hours: {
    monday: { open: '', close: '' },
    tuesday: { open: '', close: '' },
    wednesday: { open: '', close: '' },
    thursday: { open: '', close: '' },
    friday: { open: '', close: '' },
    saturday: { open: '', close: '' },
    sunday: { open: '', close: '' }
  }
})

const availableCategories = [
  'Chinese',
  'Japanese',
  'Korean',
  'Thai',
  'Vietnamese',
  'Indian',
  'Italian',
  'French',
  'American',
  'Mexican',
  'Fast Food',
  'Fine Dining'
]

const days = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' }
]

const rules: FormRules = {
  name: [
    { required: true, message: 'Please input restaurant name', trigger: 'blur' },
    { min: 2, message: 'Length should be at least 2 characters', trigger: 'blur' }
  ],
  address: [
    { required: true, message: 'Please input address', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Please input phone number', trigger: 'blur' },
    { pattern: /^(\d{3,4}-\d{7,8}|\d{11})$/, message: 'Please enter valid phone number', trigger: 'blur' }
  ],
  categories: [
    { required: true, message: 'Please select at least one category', trigger: 'change' },
    { type: 'array', min: 1, message: 'Please select at least one category', trigger: 'change' }
  ]
}

const handleImageChange: UploadProps['onChange'] = (file) => {
  const isImage = /^image\/(jpeg|png|gif|jpg)$/.test(file.raw.type)
  if (!isImage) {
    ElMessage.error('You can only upload image files!')
    return
  }

  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('Image size can not exceed 5MB!')
    return
  }

  imageFile.value = file.raw
  form.value.image = URL.createObjectURL(file.raw)
}

const loadProfile = async () => {
  try {
    loading.value = true
    let profileData;
    
    if (!restaurantId.value) {
      console.log('No restaurant ID, trying to get restaurant info')
      profileData = await restaurantAuthService.getRestaurantInfo()
      console.log('Got restaurant info:', profileData)
    } else {
      profileData = await restaurantManagementService.getRestaurantProfile(restaurantId.value)
      console.log('Got restaurant profile:', profileData)
    }

    // 确保所有必要的字段都有默认值
    if (profileData && profileData.restaurant) {
      profileData = profileData.restaurant
    }

    form.value = {
      id: profileData.id || 0,
      name: profileData.name || '',
      description: profileData.description || '',
      address: profileData.address || '',
      phone: profileData.phone || '',
      image: profileData.image || '',
      delivery_fee: parseFloat(profileData.delivery_fee) || 0,
      minimum_order: parseFloat(profileData.minimum_order) || 0,
      categories: Array.isArray(profileData.categories) ? profileData.categories : [],
      opening_hours: {
        monday: profileData.opening_hours?.monday || { open: '', close: '' },
        tuesday: profileData.opening_hours?.tuesday || { open: '', close: '' },
        wednesday: profileData.opening_hours?.wednesday || { open: '', close: '' },
        thursday: profileData.opening_hours?.thursday || { open: '', close: '' },
        friday: profileData.opening_hours?.friday || { open: '', close: '' },
        saturday: profileData.opening_hours?.saturday || { open: '', close: '' },
        sunday: profileData.opening_hours?.sunday || { open: '', close: '' }
      }
    }
    console.log('Initialized form with data:', form.value)
  } catch (error: any) {
    console.error('Failed to load profile:', error)
    ElMessage.error(error.message || 'Failed to load restaurant profile')
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  if (!formRef.value || !restaurantId.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true

    // 过滤掉空的营业时间
    const opening_hours = Object.entries(form.value.opening_hours).reduce((acc, [day, time]) => {
      if (time.open && time.close) {
        acc[day] = time
      }
      return acc
    }, {} as Record<string, { open: string; close: string }>)

    // 准备要发送的数据
    const updateData = {
      name: form.value.name,
      description: form.value.description,
      address: form.value.address,
      phone: form.value.phone,
      delivery_fee: form.value.delivery_fee,
      minimum_order: form.value.minimum_order,
      categories: form.value.categories,
      opening_hours
    }

    console.log('Sending update data to backend:', updateData)
    console.log('Restaurant ID:', restaurantId.value)

    // 更新基本信息
    const updatedProfile = await restaurantManagementService.updateRestaurantProfile(
      restaurantId.value,
      updateData
    )

    console.log('Received updated profile:', updatedProfile)

    // 如果有新图片，上传图片
    if (imageFile.value) {
      console.log('Uploading new image file:', imageFile.value.name)
      const formData = new FormData()
      formData.append('restaurantImage', imageFile.value)
      
      const uploadResult = await restaurantManagementService.uploadRestaurantImage(
        restaurantId.value,
        formData
      )
      console.log('Image upload result:', uploadResult)
      form.value.image = uploadResult.url
    }

    ElMessage.success('Profile updated successfully')
    await loadProfile() // 重新加载数据以确保显示最新信息
  } catch (error: any) {
    console.error('Failed to update profile:', error)
    if (error.response) {
      console.error('Error response:', error.response.data)
    }
    ElMessage.error(error.message || 'Failed to update profile')
  } finally {
    saving.value = false
  }
}

// 定义默认的营业时间
const defaultOpeningHours = {
  monday: { open: '', close: '' },
  tuesday: { open: '', close: '' },
  wednesday: { open: '', close: '' },
  thursday: { open: '', close: '' },
  friday: { open: '', close: '' },
  saturday: { open: '', close: '' },
  sunday: { open: '', close: '' }
}

onMounted(async () => {
  await loadProfile()
})
</script>

<style scoped lang="scss">
.restaurant-profile {
  padding: 24px;

  .page-header {
    margin-bottom: 24px;
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }

  .section {
    margin-bottom: 32px;
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

    h3 {
      margin: 0 0 24px;
      font-size: 18px;
      font-weight: 500;
      color: #303133;
    }
  }

  .time-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .time-inputs {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .time-separator {
      color: #909399;
    }
  }

  .image-upload {
    .preview-image {
      width: 200px;
      height: 200px;
      object-fit: cover;
      border-radius: 4px;
    }

    .upload-placeholder {
      width: 200px;
      height: 200px;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:hover {
        border-color: #409EFF;
      }

      .el-icon {
        font-size: 28px;
        color: #8c939d;
        margin-bottom: 8px;
      }

      .upload-tip {
        font-size: 12px;
        color: #909399;
        margin-top: 8px;
      }
    }
  }

  .form-actions {
    margin-top: 32px;
    text-align: right;
  }
}
</style> 