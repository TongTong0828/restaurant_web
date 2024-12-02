import http from '../utils/http'

export const notificationService = {
  // 获取通知列表
  async getNotifications() {
    return http.get('/api/notifications/list')
  },

  // 标记通知为已读
  async markAsRead(notificationId: string) {
    return http.put(`/api/notifications/${notificationId}/mark-read`)
  }
} 