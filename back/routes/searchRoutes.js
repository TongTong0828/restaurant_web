const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { auth } = require('../middleware/auth');

// 搜索菜单项
router.get('/menu', searchController.searchMenu);

// 搜索平台政策
router.get('/policies', searchController.searchPolicies);

// 推荐餐厅（需要认证，基于用户历史）
router.post('/recommend', auth, searchController.recommendRestaurants);

module.exports = router; 