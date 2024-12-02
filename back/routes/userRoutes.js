const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// �û�ע��
router.post('/register', authController.register);

// �û���¼
router.post('/login', authController.login);

// ��ȡ��ǰ�û���Ϣ
router.get('/me', auth, authController.getCurrentUser);

// �����û�����
router.put('/profile', auth, authController.updateProfile);

// �����û�����
router.put('/password', auth, authController.updatePassword);

// �˳���¼
router.post('/logout', auth, authController.logout);

module.exports = router; 