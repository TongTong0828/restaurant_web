const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { auth, checkRole } = require('../middleware/auth');

// �ϴ���ƷͼƬ�����޲����û���
router.post('/menu-item/:menuItemId/image', 
  auth, 
  checkRole('restaurant'), 
  uploadController.uploadMenuItemImage
);

// ɾ����ƷͼƬ�����޲����û���
router.delete('/menu-item/:menuItemId/image', 
  auth, 
  checkRole('restaurant'), 
  uploadController.deleteMenuItemImage
);

module.exports = router; 