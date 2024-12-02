const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

// 获取购物车
router.get('/', auth, cartController.getCart);

// 添加商品到购物车
router.post('/items', auth, cartController.addItem);

// 更新购物车商品数量
router.put('/items/:menuItemId', auth, cartController.updateItemQuantity);

// 删除购物车商品
router.delete('/items/:menuItemId', auth, cartController.removeItem);

// 清空购物车
router.delete('/', auth, cartController.clearCart);

module.exports = router; 