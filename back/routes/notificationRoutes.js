const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// 获取通知列表
router.get('/list', auth, notificationController.getNotifications);

// 获取未读通知数量
router.get('/unread-count', auth, notificationController.getUnreadCount);

// 标记通知为已读
router.put('/:notification_id/mark-read', auth, notificationController.markAsRead);

// 删除通知
router.delete('/:notification_id', auth, notificationController.deleteNotification);

// 创建订单相关通知
router.post('/order', auth, notificationController.createOrderNotification);

// 创建预订相关通知
router.post('/reservation', auth, notificationController.createReservationNotification);

module.exports = router; 