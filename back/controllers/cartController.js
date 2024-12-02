const Cart = require('../models/cart');
const { AppError } = require('../middleware/errorHandler');

// ��ȡ���ﳵ
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

// �����Ʒ�����ﳵ
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

// ���¹��ﳵ��Ʒ����
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

// ɾ�����ﳵ��Ʒ
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

// ��չ��ﳵ
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