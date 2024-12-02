const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// ��ȡ֪ͨ�б�
router.get('/list', auth, notificationController.getNotifications);

// ��ȡδ��֪ͨ����
router.get('/unread-count', auth, notificationController.getUnreadCount);

// ���֪ͨΪ�Ѷ�
router.put('/:notification_id/mark-read', auth, notificationController.markAsRead);

// ɾ��֪ͨ
router.delete('/:notification_id', auth, notificationController.deleteNotification);

// �����������֪ͨ
router.post('/order', auth, notificationController.createOrderNotification);

// ����Ԥ�����֪ͨ
router.post('/reservation', auth, notificationController.createReservationNotification);

module.exports = router; 