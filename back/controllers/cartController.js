const Cart = require('../models/cart');
const { AppError } = require('../middleware/errorHandler');

// 获取购物车
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.getCart(req.user.id);
    res.json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

// 添加商品到购物车
exports.addItem = async (req, res, next) => {
  try {
    const { menuItemId, quantity } = req.body;
    const cart = await Cart.addItem(req.user.id, menuItemId, quantity);
    res.status(201).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

// 更新购物车商品数量
exports.updateItemQuantity = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const { quantity } = req.body;
    const cart = await Cart.updateItemQuantity(req.user.id, menuItemId, quantity);
    res.json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

// 删除购物车商品
exports.removeItem = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const cart = await Cart.removeItem(req.user.id, menuItemId);
    res.json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

// 清空购物车
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.clearCart(req.user.id);
    res.json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
}; 