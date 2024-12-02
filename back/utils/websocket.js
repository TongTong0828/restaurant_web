const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const logger = require('./logger');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    this.restaurantClients = new Map();

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    // 定期清理断开的连接
    setInterval(() => {
      this.cleanupConnections();
    }, 30000);
  }

  handleConnection(ws, req) {
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // 根据用户类型存储连接
      if (decoded.type === 'restaurant') {
        this.restaurantClients.set(decoded.id, ws);
      } else {
        this.clients.set(decoded.id, ws);
      }

      // 设置心跳检测
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // 处理消息
      ws.on('message', (message) => {
        this.handleMessage(decoded.id, decoded.type, message);
      });

      // 处理连接关闭
      ws.on('close', () => {
        if (decoded.type === 'restaurant') {
          this.restaurantClients.delete(decoded.id);
        } else {
          this.clients.delete(decoded.id);
        }
        logger.info(`WebSocket connection closed for user ${decoded.id}`);
      });

      // 发送欢迎消息
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to WebSocket server',
        userId: decoded.id,
        userType: decoded.type
      }));

    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Authentication failed'
      }));
      ws.close();
    }
  }

  handleMessage(userId, userType, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'ping':
          this.sendToUser(userId, userType, {
            type: 'pong',
            message: 'Server is alive'
          });
          break;

        case 'order_status':
          this.handleOrderStatusUpdate(userId, userType, data);
          break;

        case 'chat_message':
          this.handleChatMessage(userId, userType, data);
          break;

        case 'delivery_location':
          this.handleDeliveryLocation(userId, userType, data);
          break;

        default:
          logger.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      logger.error('Error handling message:', error);
    }
  }

  sendToUser(userId, userType, data) {
    const clients = userType === 'restaurant' ? this.restaurantClients : this.clients;
    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcast(data, excludeUserId = null) {
    // 广播给所有客户
    this.clients.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });

    // 广播给所有餐厅
    this.restaurantClients.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }

  // 发送订单状态更新
  sendOrderUpdate(userId, orderData) {
    this.sendToUser(userId, 'customer', {
      type: 'orderUpdate',
      data: orderData
    });

    // 同时通知餐厅
    if (orderData.restaurant_id) {
      this.sendToUser(orderData.restaurant_id, 'restaurant', {
        type: 'orderUpdate',
        data: orderData
      });
    }
  }

  // 发送新通知
  sendNotification(userId, userType, notification) {
    this.sendToUser(userId, userType, {
      type: 'notification',
      data: notification
    });
  }

  // 发送聊天消息
  sendChatMessage(fromUserId, toUserId, message) {
    const chatData = {
      type: 'chat_message',
      data: {
        from: fromUserId,
        message: message,
        timestamp: new Date().toISOString()
      }
    };

    // 发送给接收者
    this.sendToUser(toUserId, 'customer', chatData);
    // 发送给发送者（确认消息已发送）
    this.sendToUser(fromUserId, 'customer', {
      ...chatData,
      status: 'sent'
    });
  }

  // 发送配送位置更新
  sendDeliveryLocation(orderId, location) {
    const locationData = {
      type: 'delivery_location',
      data: {
        order_id: orderId,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString()
      }
    };

    // 通知相关的客户和餐厅
    if (location.customer_id) {
      this.sendToUser(location.customer_id, 'customer', locationData);
    }
    if (location.restaurant_id) {
      this.sendToUser(location.restaurant_id, 'restaurant', locationData);
    }
  }

  // 处理订单状态更新
  handleOrderStatusUpdate(userId, userType, data) {
    const { order_id, status, message } = data;
    // 验证权限
    if (userType !== 'restaurant') {
      logger.warn(`Unauthorized order status update attempt by user ${userId}`);
      return;
    }
    // 广播订单状态更新
    this.sendOrderUpdate(data.customer_id, {
      order_id,
      status,
      message,
      updated_at: new Date().toISOString()
    });
  }

  // 处理聊天消息
  handleChatMessage(userId, userType, data) {
    const { to_user_id, message } = data;
    this.sendChatMessage(userId, to_user_id, message);
  }

  // 处理配送位置更新
  handleDeliveryLocation(userId, userType, data) {
    const { order_id, latitude, longitude } = data;
    this.sendDeliveryLocation(order_id, {
      latitude,
      longitude,
      customer_id: data.customer_id,
      restaurant_id: data.restaurant_id
    });
  }

  // 清理断开的连接
  cleanupConnections() {
    const cleanup = (clients) => {
      clients.forEach((ws, userId) => {
        if (!ws.isAlive) {
          ws.terminate();
          clients.delete(userId);
          logger.info(`Terminated inactive connection for user ${userId}`);
        } else {
          ws.isAlive = false;
          ws.ping();
        }
      });
    };

    cleanup(this.clients);
    cleanup(this.restaurantClients);
  }
}

module.exports = WebSocketServer; 