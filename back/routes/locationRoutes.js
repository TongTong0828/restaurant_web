const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { auth, restaurantAuth } = require('../middleware/auth');

// ��ַת��Ϊ��γ��
router.post('/geocode', locationController.geocodeAddress);

// ���������ʱ�����
router.get('/estimate-delivery', locationController.estimateDelivery);

// ���Ҹ�������
router.post('/nearby-restaurants', locationController.findNearbyRestaurants);

// ���²���λ�ã���Ҫ������֤��
router.put('/restaurant', restaurantAuth, locationController.updateRestaurantLocation);

// ��������������Ҫ������֤��
router.put('/delivery-area', restaurantAuth, locationController.updateDeliveryArea);

// ������Ϳ�����
router.post('/check-delivery', locationController.checkDeliveryAvailability);

module.exports = router; 