const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// 用户注册
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 获取当前用户信息
router.get('/me', auth, authController.getCurrentUser);

// 更新用户资料
router.put('/profile', auth, authController.updateProfile);

// 更新用户密码
router.put('/password', auth, authController.updatePassword);

// 退出登录
router.post('/logout', auth, authController.logout);

module.exports = router; 