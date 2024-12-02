const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const auth = async (req, res, next) => {
  try {
    // 获取 token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Received token:', token);
    }

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // 验证 token
    console.log('Verifying token with secret:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // 将用户信息添加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

// 检查用户角色的中间件
const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    if (req.user.role !== role) {
      return next(new AppError(`${role} access required`, 403));
    }
    
    next();
  };
};

const restaurantAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'restaurant') {
        throw new AppError('Restaurant access required', 403);
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateToken,
  auth,
  restaurantAuth,
  checkRole
}; 