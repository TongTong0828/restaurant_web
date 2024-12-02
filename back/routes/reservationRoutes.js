const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { auth, restaurantAuth } = require('../middleware/auth');

// ����Ԥ��
router.post('/create', auth, reservationController.createReservation);

// ��ȡ�û���Ԥ���б�
router.get('/user', auth, reservationController.getUserReservations);

// ��ȡ������Ԥ���б���Ҫ������֤��
router.get('/restaurant', restaurantAuth, reservationController.getRestaurantReservations);

// ȡ��Ԥ��
router.put('/:reservation_id/cancel', auth, reservationController.cancelReservation);

// ����Ԥ��״̬����Ҫ������֤��
router.put('/:reservation_id/status', restaurantAuth, reservationController.updateReservationStatus);

// ��ȡ����ʱ���
router.get('/available-slots', reservationController.getAvailableTimeSlots);

module.exports = router; 