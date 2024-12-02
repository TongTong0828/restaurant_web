import axios from 'axios'
import { ElMessage } from 'element-plus'
import { API_BASE_URL } from '@/config'
import router from '@/router'
import { useUserStore } from '@/stores/user'

// 添加URL转换函数
const convertImageUrl = (data: any) => {
  if (!data) return data
  
  const oldDomain = 'hrsnqgjcwrff.sealoshzh.site'
  const newDomain = 'enbytdqrskag.sealoshzh.site'
  
  const processValue = (value: any): any => {
    if (typeof value === 'string') {
      // 处理完整的URL（包含https://）
      if (value.includes(oldDomain)) {
        return value.replace(oldDomain, newDomain).replace(/^(?!https?:\/\/)/, 'https://')
      }
      // 处理相对路径
      if (value.startsWith('/uploads/')) {
        return `https://${newDomain}${value}`
      }
    }
    return value
  }
  
  const processObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(item => processObject(item))
    }
    
    if (obj && typeof obj === 'object') {
      const newObj = { ...obj }
      for (const key in newObj) {
        if (Object.prototype.hasOwnProperty.call(newObj, key)) {
          // 特别处理可能包含图片URL的字段
          if (['image', 'image_url', 'avatar', 'logo', 'thumbnail'].includes(key)) {
            newObj[key] = processValue(newObj[key])
          } else {
            newObj[key] = processObject(newObj[key])
          }
        }
      }
      return newObj
    }
    
    return processValue(obj)
  }
  
  return processObject(data)
}

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() }
    }

    // 添加详细的请求日志
    console.log('Request Details:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params
    })

    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
request.interceptors.response.use(
  response => {
    // 添加响应成功的日志
    console.log('Response success:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers
    })
    
    // 处理响应数据中的图片URL
    const processedData = convertImageUrl(response.data)
    return processedData
  },
  error => {
    // 添加详细的错误日志
    const errorDetails = {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
      config: error.config ? {
        baseURL: error.config.baseURL,
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        data: error.config.data,
        params: error.config.params,
        timeout: error.config.timeout
      } : undefined,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : undefined,
      request: error.request ? {
        readyState: error.request.readyState,
        status: error.request.status,
        statusText: error.request.statusText,
        responseURL: error.request.responseURL,
        responseType: error.request.responseType,
        responseText: error.request.responseText,
        response: error.request.response
      } : undefined
    }
    console.error('Request failed:', errorDetails)

    if (error.code === 'ERR_NETWORK') {
      ElMessage.error({
        message: 'Network error. Please check your connection and try again.',
        duration: 5000
      })
    } else if (error.response) {
      const message = error.response.data?.message || error.message
      if (error.response.status === 401) {
        const userStore = useUserStore()
        userStore.logout()
        // Save current path for redirect after login
        if (router.currentRoute.value.name !== 'Login' && 
            router.currentRoute.value.name !== 'RestaurantLogin') {
          localStorage.setItem('redirectPath', router.currentRoute.value.fullPath)
          // 根据当前路由判断重定向到哪个登录页面
          if (router.currentRoute.value.path.startsWith('/restaurant-admin')) {
            router.push('/restaurant/login')
          } else {
            router.push('/auth/login')
          }
        }
      }
      ElMessage.error({
        message: message,
        duration: 5000
      })
    } else if (error.request) {
      ElMessage.error({
        message: 'No response received from server. Please try again.',
        duration: 5000
      })
    } else {
      ElMessage.error({
        message: 'Request failed. Please try again.',
        duration: 5000
      })
    }
    return Promise.reject(error)
  }
)

export default request 