const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { auth, restaurantAuth } = require('../middleware/auth');

// 创建预订
router.post('/create', auth, reservationController.createReservation);

// 获取用户的预订列表
router.get('/user', auth, reservationController.getUserReservations);

// 获取餐厅的预订列表（需要餐厅认证）
router.get('/restaurant', restaurantAuth, reservationController.getRestaurantReservations);

// 取消预订
router.put('/:reservation_id/cancel', auth, reservationController.cancelReservation);

// 更新预订状态（需要餐厅认证）
router.put('/:reservation_id/status', restaurantAuth, reservationController.updateReservationStatus);

// 获取可用时间段
router.get('/available-slots', reservationController.getAvailableTimeSlots);

module.exports = router; 