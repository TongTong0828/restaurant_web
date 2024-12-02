const Auth = require('../models/auth');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// �û�ע��
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

// �û���¼
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

// ��ȡ��ǰ�û���Ϣ
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

// �����û�����
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

// �����û�����
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

// �˳���¼
exports.logout = async (req, res, next) => {
  try {
    // ����ʹ��JWT���������˲���Ҫ���⴦��
    res.json({
      status: 'success',
      message: 'Successfully logged out'
    });
  } catch (error) {
    next(error);
  }
}; 