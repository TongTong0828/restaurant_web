const User = require('../models/user');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// 点餐用户注册
exports.registerCustomer = async (req, res, next) => {
  try {
    const user = await User.registerCustomer(req.body);
    const token = generateToken(user);
    res.status(201).json({
      status: 'success',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

// 餐厅用户注册
exports.registerRestaurant = async (req, res, next) => {
  try {
    const restaurant = await User.registerRestaurant(req.body);
    const token = generateToken(restaurant);
    res.status(201).json({
      status: 'success',
      data: { restaurant, token }
    });
  } catch (error) {
    next(error);
  }
};

// 点餐用户登录
exports.loginCustomer = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.loginCustomer(username, password);
    const token = generateToken(user);
    res.json({
      status: 'success',
      data: { user, token }
    });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }
    next(error);
  }
};

// 餐厅用户登录
exports.loginRestaurant = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const restaurant = await User.loginRestaurant(username, password);
    const token = generateToken(restaurant);
    res.json({
      status: 'success',
      data: { restaurant, token }
    });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    } else if (error.message === 'Restaurant account is suspended') {
      return res.status(403).json({
        status: 'error',
        message: 'Restaurant account is suspended'
      });
    }
    next(error);
  }
};

// 更新点餐用户信息
exports.updateCustomerProfile = async (req, res, next) => {
  try {
    const updatedUser = await User.updateCustomerProfile(req.user.id, req.body);
    res.json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

// 更新餐厅信息
exports.updateRestaurantProfile = async (req, res, next) => {
  try {
    const updatedRestaurant = await User.updateRestaurantProfile(req.user.id, req.body);
    res.json({
      status: 'success',
      data: { restaurant: updatedRestaurant }
    });
  } catch (error) {
    next(error);
  }
};

// 用户升级为餐厅
exports.upgradeToRestaurant = async (req, res, next) => {
  try {
    const restaurant = await User.upgradeToRestaurant(req.user.id, req.body);
    const token = generateToken(restaurant);
    res.json({
      status: 'success',
      data: { restaurant, token }
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户角色
exports.getUserRole = async (req, res, next) => {
  try {
    res.json({
      status: 'success',
      data: {
        id: req.user.id,
        type: req.user.type,
        username: req.user.username || req.user.restaurant_name
      }
    });
  } catch (error) {
    next(error);
  }
}; 