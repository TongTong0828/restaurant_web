require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const restaurantManagementRoutes = require('./routes/restaurantManagementRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

const app = express();

// 配置CORS - 必须在其他中间件之前
app.use(cors({
  origin: [
    'http://localhost:9527',
    'https://wcwxhuqmzzsr.sealoshzh.site',
    'http://localhost:57138',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://hrsnqgjcwrff.sealoshzh.site'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth/restaurant', restaurantManagementRoutes);
app.use('/api/upload', uploadRoutes);

// 错误处理
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';  // 监听所有网络接口

const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    
    app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 