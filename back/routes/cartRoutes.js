const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

// ��ȡ���ﳵ
router.get('/', auth, cartController.getCart);

// �����Ʒ�����ﳵ
router.post('/items', auth, cartController.addItem);

// ���¹��ﳵ��Ʒ����
router.put('/items/:menuItemId', auth, cartController.updateItemQuantity);

// ɾ�����ﳵ��Ʒ
router.delete('/items/:menuItemId', auth, cartController.removeItem);

// ��չ��ﳵ
router.delete('/', auth, cartController.clearCart);

module.exports = router; 