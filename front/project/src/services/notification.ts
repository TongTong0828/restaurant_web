import http from '../utils/http'

export const notificationService = {
  // ��ȡ֪ͨ�б�
  async getNotifications() {
    return http.get('/api/notifications/list')
  },

  // ���֪ͨΪ�Ѷ�
  async markAsRead(notificationId: string) {
    return http.put(`/api/notifications/${notificationId}/mark-read`)
  }
} 