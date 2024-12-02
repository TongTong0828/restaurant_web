const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'restaurant-mysql.ns-9209e67m.svc',
  user: 'root',
  password: '6kmsc5tx',
  database: 'restaurant',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 获取数据库连接池
const getPool = () => pool;

// 测试数据库连接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

module.exports = {
  getPool,
  testConnection
}; 