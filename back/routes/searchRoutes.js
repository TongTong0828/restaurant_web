const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { auth } = require('../middleware/auth');

// �����˵���
router.get('/menu', searchController.searchMenu);

// ����ƽ̨����
router.get('/policies', searchController.searchPolicies);

// �Ƽ���������Ҫ��֤�������û���ʷ��
router.post('/recommend', auth, searchController.recommendRestaurants);

module.exports = router; 