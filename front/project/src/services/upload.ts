import http from '../utils/http'

export const uploadService = {
  // �ϴ�����ͼƬ
  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append('image', file)
    return http.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // �ϴ����ͼƬ
  async uploadImages(files: File[]) {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })
    return http.post('/api/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
} 