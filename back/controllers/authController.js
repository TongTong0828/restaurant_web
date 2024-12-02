const Auth = require('../models/auth');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// 用户注册
exports.register = async (req, res, next) => {
  try {
    const user = await Auth.register(req.body);
    const token = generateToken(user);
    res.status(201).json({
      status: 'success',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

// 用户登录
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await Auth.login(email, password);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await Auth.getCurrentUser(req.user.id);
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// 更新用户资料
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await Auth.updateProfile(req.user.id, req.body);
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// 更新用户密码
exports.updatePassword = async (req, res, next) => {
  try {
    const result = await Auth.updatePassword(req.user.id, req.body);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 退出登录
exports.logout = async (req, res, next) => {
  try {
    // 由于使用JWT，服务器端不需要特殊处理
    res.json({
      status: 'success',
      message: 'Successfully logged out'
    });
  } catch (error) {
    next(error);
  }
}; 