const database = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/errorHandler');

class Auth {
  static async register(userData) {
    const pool = database.getPool();
    const { email, password, name, phone } = userData;
    
    try {
      // ��������Ƿ��Ѵ���
      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        throw new AppError('Email already exists', 400);
      }
      
      // ��������
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // �����û�
      const [result] = await pool.query(
        `INSERT INTO users (email, password, name, phone, role)
         VALUES (?, ?, ?, ?, 'customer')`,
        [email, hashedPassword, name, phone]
      );
      
      const userId = result.insertId;
      
      // ��ȡ�û���Ϣ�����������룩
      const [users] = await pool.query(
        'SELECT id, email, name, phone, role FROM users WHERE id = ?',
        [userId]
      );
      
      return users[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating user', 500);
    }
  }
  
  static async login(email, password) {
    const pool = database.getPool();
    try {
      // ��ȡ�û���Ϣ
      const [users] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (users.length === 0) {
        throw new AppError('Invalid credentials', 401);
      }
      
      const user = users[0];
      
      // ��֤����
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }
      
      // ���� JWT token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // �����û���Ϣ�����������룩
      const { password: _, ...userWithoutPassword } = user;
      return { token, user: userWithoutPassword };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error during login', 500);
    }
  }
  
  static async getCurrentUser(userId) {
    const pool = database.getPool();
    try {
      const [users] = await pool.query(
        'SELECT id, email, name, phone, role FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        throw new AppError('User not found', 404);
      }
      
      return users[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error fetching user', 500);
    }
  }

  static async updateProfile(userId, userData) {
    const pool = database.getPool();
    const { name, phone } = userData;
    
    try {
      // ����û��Ƿ����
      const [users] = await pool.query(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        throw new AppError('User not found', 404);
      }
      
      // �����û�����
      await pool.query(
        `UPDATE users 
         SET name = ?, phone = ?
         WHERE id = ?`,
        [name, phone, userId]
      );
      
      // ��ȡ���º���û���Ϣ
      const [updatedUsers] = await pool.query(
        'SELECT id, email, name, phone, role FROM users WHERE id = ?',
        [userId]
      );
      
      return updatedUsers[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating user profile', 500);
    }
  }

  static async updatePassword(userId, { currentPassword, newPassword }) {
    const pool = database.getPool();
    
    try {
      // ��ȡ�û���Ϣ
      const [users] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        throw new AppError('User not found', 404);
      }
      
      const user = users[0];
      
      // ��֤��ǰ����
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }
      
      // ����������
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // ��������
      await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      
      return { message: 'Password updated successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating password', 500);
    }
  }
}

module.exports = Auth; 